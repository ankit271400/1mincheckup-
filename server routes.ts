import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import OpenAI from "openai";

// Check if OpenAI API key is available
const openaiApiKey = process.env.OPENAI_API_KEY || "";
if (!openaiApiKey) {
  console.warn("WARNING: OPENAI_API_KEY is not set. AI features will not work properly.");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: openaiApiKey });

// Basic validation schemas
const bloodSugarSchema = z.object({
  value: z.number().min(20).max(600),
  timestamp: z.string().datetime(),
  notes: z.string().optional(),
});

const bloodPressureSchema = z.object({
  systolic: z.number().min(70).max(250)             ,
  diastolic: z.number().min(40).max(150),
  timestamp: z.string().datetime(),
  notes: z.string().optional(),
});

const aiQuestionSchema = z.object({
  question: z.string().min(1).max(500),
});

// Get user ID - In a real app, this would come from authentication
// For this demo, we'll use a fixed user ID of 1
const getUserId = (req: Request): number => 1;

// Helper function to handle errors
const handleError = (res: Response, error: unknown) => {
  console.error("Error:", error);
  
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: fromZodError(error).message 
    });
  }
  
  return res.status(500).json({ 
    message: error instanceof Error ? error.message : "An unexpected error occurred" 
  });
};

// Format timestamp for display
const formatTimestamp = (timestamp: Date | string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise return full date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }) + ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// Determine status based on blood sugar value
const getBloodSugarStatus = (value: number): { status: string; statusType: string } => {
  if (value < 70) return { status: "Low", statusType: "elevated" };
  if (value < 80) return { status: "Borderline Low", statusType: "elevated" };
  if (value <= 130) return { status: "Normal", statusType: "normal" };
  if (value <= 180) return { status: "Elevated", statusType: "elevated" };
  return { status: "High", statusType: "elevated" };
};

// Determine status based on blood pressure values
const getBloodPressureStatus = (
  systolic: number, 
  diastolic: number
): { status: string; statusType: string } => {
  if (systolic < 90 || diastolic < 60) return { status: "Low", statusType: "elevated" };
  if (systolic < 120 && diastolic < 80) return { status: "Normal", statusType: "normal" };
  if (systolic < 130 && diastolic < 80) return { status: "Elevated", statusType: "elevated" };
  if (systolic < 140 || diastolic < 90) return { status: "Hypertension Stage 1", statusType: "elevated" };
  if (systolic < 180 || diastolic < 120) return { status: "Hypertension Stage 2", statusType: "elevated" };
  return { status: "Hypertensive Crisis", statusType: "elevated" };
};

// Analyze blood sugar with AI
async function analyzeBloodSugar(value: number, previousReadings?: number[]) {
  try {
    const prompt = `
You are a medical AI assistant helping analyze a blood sugar reading.
Value: ${value} mg/dL
Previous readings: ${previousReadings ? previousReadings.join(', ') : 'None'}

Based on this information, provide a brief analysis with the following in JSON format:
1. "status": One of ["Normal", "Elevated", "High", "Very High", "Low", "Very Low"]
2. "suggestion": A brief medical suggestion (1-2 sentences)
3. "riskLevel": A number from 0-100 representing health risk (0 is lowest risk, 100 is highest)

Response must be valid JSON.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing blood sugar:", error);
    return {
      status: getBloodSugarStatus(value).status,
      suggestion: "Unable to provide AI analysis at this time.",
      riskLevel: value > 180 || value < 70 ? 70 : value > 140 || value < 80 ? 40 : 10
    };
  }
}

// Analyze blood pressure with AI
async function analyzeBloodPressure(
  systolic: number, 
  diastolic: number, 
  previousReadings?: { systolic: number, diastolic: number }[]
) {
  try {
    const prompt = `
You are a medical AI assistant helping analyze a blood pressure reading.
Systolic: ${systolic} mmHg
Diastolic: ${diastolic} mmHg
Previous readings: ${previousReadings ? previousReadings.map(r => `${r.systolic}/${r.diastolic}`).join(', ') : 'None'}

Based on this information, provide a brief analysis with the following in JSON format:
1. "status": One of ["Normal", "Elevated", "Hypertension Stage 1", "Hypertension Stage 2", "Hypertensive Crisis", "Low"]
2. "suggestion": A brief medical suggestion (1-2 sentences)
3. "riskLevel": A number from 0-100 representing health risk (0 is lowest risk, 100 is highest)

Response must be valid JSON.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing blood pressure:", error);
    return {
      status: getBloodPressureStatus(systolic, diastolic).status,
      suggestion: "Unable to provide AI analysis at this time.",
      riskLevel: (systolic > 140 || diastolic > 90) ? 70 : (systolic > 120 || diastolic > 80) ? 40 : 10
    };
  }
}

// AI assistant response
async function getAIAssistantResponse(question: string): Promise<string> {
  try {
    const prompt = `
You are a helpful health AI assistant. Provide a concise, informative response to the user's health-related question.
The response should be professional but friendly, and limited to 3-4 sentences in most cases.
If you don't know the answer to a specific medical question, acknowledge that and recommend consulting a healthcare professional.
Do not include any disclaimers about not being a doctor in your response.

User's question: ${question}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 250
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request at the moment.";
  } catch (error) {
    console.error("Error getting AI assistant response:", error);
    return "I apologize, but I'm having trouble processing your request at the moment. Please try again later.";
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the application
  const apiRouter = app.use('/api', (req, res, next) => {
    // Set response timeout to ensure we meet 60 second response time requirement
    res.setTimeout(55000, () => {
      res.status(504).json({ message: "Request timeout exceeded. Please try again." });
    });
    next();
  });

  // Blood Sugar Reading endpoints
  app.post('/api/readings/blood-sugar', async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = bloodSugarSchema.parse(req.body);
      
      // Get previous readings for context
      const previousReadings = await storage.getBloodSugarReadings(userId, 5);
      const previousValues = previousReadings.map(r => r.value);
      
      // Get status based on value
      const { status, statusType } = getBloodSugarStatus(data.value);
      
      // Use AI to analyze the reading (with timeout)
      const aiAnalysisPromise = analyzeBloodSugar(data.value, previousValues);
      const aiAnalysis = await Promise.race([
        aiAnalysisPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI analysis timeout")), 50000))
      ]).catch(err => {
        console.warn("AI analysis failed or timed out:", err.message);
        return {
          status,
          suggestion: "Analysis timed out. Please try again later.",
          riskLevel: 0
        };
      });
      
      // Create the reading in storage
      const reading = await storage.createBloodSugarReading({
        userId,
        value: data.value,
        timestamp: new Date(data.timestamp),
        notes: data.notes || "",
        status,
        aiAnalysis: aiAnalysis as any
      });
      
      res.status(201).json({
        id: reading.id,
        value: reading.value,
        timestamp: reading.timestamp,
        notes: reading.notes,
        status,
        statusType,
        aiAnalysis
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/readings/blood-sugar', async (req, res) => {
    try {
      const userId = getUserId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const period = req.query.period as string || 'week';
      
      // Get readings from storage
      let readings = await storage.getBloodSugarReadings(userId, 100, 0);
      
      // Filter by period if needed
      if (period) {
        const now = new Date();
        let cutoffDate = new Date();
        
        if (period === 'week') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
          cutoffDate.setMonth(now.getMonth() - 1);
        } else if (period === 'year') {
          cutoffDate.setFullYear(now.getFullYear() - 1);
        }
        
        readings = readings.filter(r => new Date(r.timestamp) >= cutoffDate);
      }
      
      // Format for chart display
      const chartData = readings.map(reading => {
        const date = new Date(reading.timestamp);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: reading.value,
          timestamp: date.toISOString()
        };
      });
      
      res.json(chartData);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Blood Pressure Reading endpoints
  app.post('/api/readings/blood-pressure', async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = bloodPressureSchema.parse(req.body);
      
      // Get previous readings for context
      const previousReadings = await storage.getBloodPressureReadings(userId, 5);
      const previousValues = previousReadings.map(r => ({ 
        systolic: r.systolic, 
        diastolic: r.diastolic 
      }));
      
      // Get status based on values
      const { status, statusType } = getBloodPressureStatus(data.systolic, data.diastolic);
      
      // Use AI to analyze the reading (with timeout)
      const aiAnalysisPromise = analyzeBloodPressure(data.systolic, data.diastolic, previousValues);
      const aiAnalysis = await Promise.race([
        aiAnalysisPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI analysis timeout")), 50000))
      ]).catch(err => {
        console.warn("AI analysis failed or timed out:", err.message);
        return {
          status,
          suggestion: "Analysis timed out. Please try again later.",
          riskLevel: 0
        };
      });
      
      // Create the reading in storage
      const reading = await storage.createBloodPressureReading({
        userId,
        systolic: data.systolic,
        diastolic: data.diastolic,
        timestamp: new Date(data.timestamp),
        notes: data.notes || "",
        status,
        aiAnalysis: aiAnalysis as any
      });
      
      res.status(201).json({
        id: reading.id,
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        value: `${reading.systolic}/${reading.diastolic}`,
        timestamp: reading.timestamp,
        notes: reading.notes,
        status,
        statusType,
        aiAnalysis
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/readings/blood-pressure', async (req, res) => {
    try {
      const userId = getUserId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const period = req.query.period as string || 'week';
      
      // Get readings from storage
      let readings = await storage.getBloodPressureReadings(userId, 100, 0);
      
      // Filter by period if needed
      if (period) {
        const now = new Date();
        let cutoffDate = new Date();
        
        if (period === 'week') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
          cutoffDate.setMonth(now.getMonth() - 1);
        } else if (period === 'year') {
          cutoffDate.setFullYear(now.getFullYear() - 1);
        }
        
        readings = readings.filter(r => new Date(r.timestamp) >= cutoffDate);
      }
      
      // Format for chart display
      const chartData = readings.map(reading => {
        const date = new Date(reading.timestamp);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          systolic: reading.systolic,
          diastolic: reading.diastolic,
          timestamp: date.toISOString()
        };
      });
      
      res.json(chartData);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get dashboard summary
  app.get('/api/readings/summary', async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Get latest readings
      const latestBloodSugar = await storage.getLatestBloodSugarReading(userId);
      const latestBloodPressure = await storage.getLatestBloodPressureReading(userId);
      
      // Prepare summary response
      const summary = {
        bloodSugar: latestBloodSugar ? {
          latest: {
            value: latestBloodSugar.value,
            time: formatTimestamp(latestBloodSugar.timestamp)
          },
          status: latestBloodSugar.status || getBloodSugarStatus(latestBloodSugar.value).status,
          statusType: getBloodSugarStatus(latestBloodSugar.value).statusType
        } : null,
        
        bloodPressure: latestBloodPressure ? {
          latest: {
            value: `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic}`,
            time: formatTimestamp(latestBloodPressure.timestamp)
          },
          status: latestBloodPressure.status || 
            getBloodPressureStatus(latestBloodPressure.systolic, latestBloodPressure.diastolic).status,
          statusType: getBloodPressureStatus(
            latestBloodPressure.systolic, 
            latestBloodPressure.diastolic
          ).statusType
        } : null,
        
        heartRate: {
          latest: {
            value: 72,
            time: "Today, 9:34 AM"
          },
          status: "Normal",
          statusType: "normal"
        },
        
        weight: {
          latest: {
            value: 168,
            time: "Yesterday, 8:15 AM"
          },
          change: "-2 lbs",
          status: "Decreasing",
          statusType: "neutral"
        }
      };
      
      res.json(summary);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get recent readings for the sidebar
  app.get('/api/readings/recent', async (req, res) => {
    try {
      const userId = getUserId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      
      // Get recent readings of both types
      const bloodSugarReadings = await storage.getBloodSugarReadings(userId, limit);
      const bloodPressureReadings = await storage.getBloodPressureReadings(userId, limit);
      
      // Format blood sugar readings
      const formattedBSReadings = bloodSugarReadings.map(r => ({
        id: r.id,
        type: "Blood Sugar",
        value: `${r.value} mg/dL`,
        time: formatTimestamp(r.timestamp),
        timestamp: new Date(r.timestamp).toISOString(),
        status: r.status || getBloodSugarStatus(r.value).status,
        statusType: getBloodSugarStatus(r.value).statusType
      }));
      
      // Format blood pressure readings
      const formattedBPReadings = bloodPressureReadings.map(r => ({
        id: r.id,
        type: "Blood Pressure",
        value: `${r.systolic}/${r.diastolic} mmHg`,
        time: formatTimestamp(r.timestamp),
        timestamp: new Date(r.timestamp).toISOString(),
        status: r.status || getBloodPressureStatus(r.systolic, r.diastolic).status,
        statusType: getBloodPressureStatus(r.systolic, r.diastolic).statusType
      }));
      
      // Combine and sort by timestamp
      const combined = [...formattedBSReadings, ...formattedBPReadings]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      
      res.json(combined);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get historical readings
  app.get('/api/readings/history', async (req, res) => {
    try {
      const userId = getUserId(req);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const type = req.query.type as string;
      
      const offset = (page - 1) * pageSize;
      
      let readings = [];
      
      if (!type || type === 'all') {
        // Get both types of readings
        const bloodSugarReadings = await storage.getBloodSugarReadings(userId, 100);
        const bloodPressureReadings = await storage.getBloodPressureReadings(userId, 100);
        
        // Format blood sugar readings
        const formattedBSReadings = bloodSugarReadings.map(r => ({
          id: r.id,
          type: "Blood Sugar",
          value: `${r.value} mg/dL`,
          timestamp: new Date(r.timestamp).toISOString(),
          notes: r.notes,
          status: r.status || getBloodSugarStatus(r.value).status,
          statusType: getBloodSugarStatus(r.value).statusType
        }));
        
        // Format blood pressure readings
        const formattedBPReadings = bloodPressureReadings.map(r => ({
          id: r.id,
          type: "Blood Pressure",
          value: `${r.systolic}/${r.diastolic} mmHg`,
          timestamp: new Date(r.timestamp).toISOString(),
          notes: r.notes,
          status: r.status || getBloodPressureStatus(r.systolic, r.diastolic).status,
          statusType: getBloodPressureStatus(r.systolic, r.diastolic).statusType
        }));
        
        // Combine and sort by timestamp
        readings = [...formattedBSReadings, ...formattedBPReadings]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else if (type === 'blood_sugar') {
        // Get only blood sugar readings
        const bloodSugarReadings = await storage.getBloodSugarReadings(userId, 100);
        
        readings = bloodSugarReadings.map(r => ({
          id: r.id,
          type: "Blood Sugar",
          value: `${r.value} mg/dL`,
          timestamp: new Date(r.timestamp).toISOString(),
          notes: r.notes,
          status: r.status || getBloodSugarStatus(r.value).status,
          statusType: getBloodSugarStatus(r.value).statusType
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else if (type === 'blood_pressure') {
        // Get only blood pressure readings
        const bloodPressureReadings = await storage.getBloodPressureReadings(userId, 100);
        
        readings = bloodPressureReadings.map(r => ({
          id: r.id,
          type: "Blood Pressure",
          value: `${r.systolic}/${r.diastolic} mmHg`,
          timestamp: new Date(r.timestamp).toISOString(),
          notes: r.notes,
          status: r.status || getBloodPressureStatus(r.systolic, r.diastolic).status,
          statusType: getBloodPressureStatus(r.systolic, r.diastolic).statusType
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      
      // Paginate
      const paginatedReadings = readings.slice(offset, offset + pageSize);
      
      res.json({
        readings: paginatedReadings,
        pagination: {
          total: readings.length,
          pages: Math.ceil(readings.length / pageSize),
          currentPage: page,
          pageSize
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Connected devices endpoints
  app.get('/api/devices', async (req, res) => {
    try {
      const userId = getUserId(req);
      const devices = await storage.getDevices(userId);
      
      // Format device data
      const formattedDevices = devices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        icon: device.type === 'glucometer' ? 'device_thermostat' : 'favorite_border',
        lastSync: formatTimestamp(device.lastSync || new Date()),
        status: device.status || 'connected'
      }));
      
      res.json(formattedDevices);
    } catch (error) {
      handleError(res, error);
    }
  });

  // User profile endpoints
  app.get('/api/profile', async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return only relevant profile fields
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age?.toString(),
        gender: user.gender,
        height: user.height?.toString(),
        weight: user.weight?.toString(),
        conditions: user.conditions || [],
        medications: user.medications || []
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/profile', async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUser(userId, {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age ? parseInt(req.body.age) : user.age,
        gender: req.body.gender,
        height: req.body.height ? parseInt(req.body.height) : user.height,
        weight: req.body.weight ? parseInt(req.body.weight) : user.weight,
        conditions: req.body.conditions || user.conditions,
        medications: req.body.medications || user.medications
      });
      
      res.json({
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        age: updatedUser?.age?.toString(),
        gender: updatedUser?.gender,
        height: updatedUser?.height?.toString(),
        weight: updatedUser?.weight?.toString(),
        conditions: updatedUser?.conditions || [],
        medications: updatedUser?.medications || []
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // AI Assistant endpoints
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const userId = getUserId(req);
      const { question } = aiQuestionSchema.parse(req.body);
      
      // Start a timer to track response time
      const startTime = Date.now();
      
      // Get the AI response (with timeout)
      const responsePromise = getAIAssistantResponse(question);
      const aiResponse = await Promise.race([
        responsePromise,
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error("AI response timeout")), 50000)
        )
      ]).catch(err => {
        console.warn("AI response timed out:", err.message);
        return "I'm sorry, but it's taking me longer than expected to process your request. Please try asking again or simplify your question.";
      });
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      console.log(`AI response time: ${responseTime}ms`);
      
      // Format the timestamp for display
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Store the chat history
      await storage.createAIChatHistory({
        userId,
        message: question,
        response: aiResponse,
        timestamp: new Date(),
        category: 'general'
      });
      
      res.json({
        message: aiResponse,
        timestamp
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/ai/analyze-blood-sugar', async (req, res) => {
    try {
      const value = req.body.value;
      const previousReadings = req.body.previousReadings || [];
      
      if (!value || isNaN(value)) {
        return res.status(400).json({ message: "Invalid blood sugar value" });
      }
      
      // Start a timer to track response time
      const startTime = Date.now();
      
      // Get the AI analysis (with timeout)
      const analysisPromise = analyzeBloodSugar(value, previousReadings);
      const analysis = await Promise.race([
        analysisPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI analysis timeout")), 50000))
      ]).catch(err => {
        console.warn("AI analysis timed out:", err.message);
        const { status } = getBloodSugarStatus(value);
        return {
          status,
          suggestion: "Analysis timed out. Please try again later.",
          riskLevel: value > 180 || value < 70 ? 70 : value > 140 || value < 80 ? 40 : 10
        };
      });
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      console.log(`Blood sugar analysis time: ${responseTime}ms`);
      
      res.json(analysis);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/ai/analyze-blood-pressure', async (req, res) => {
    try {
      const { systolic, diastolic } = req.body;
      const previousReadings = req.body.previousReadings || [];
      
      if (!systolic || !diastolic || isNaN(systolic) || isNaN(diastolic)) {
        return res.status(400).json({ message: "Invalid blood pressure values" });
      }
      
      // Start a timer to track response time
      const startTime = Date.now();
      
      // Get the AI analysis (with timeout)
      const analysisPromise = analyzeBloodPressure(systolic, diastolic, previousReadings);
      const analysis = await Promise.race([
        analysisPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI analysis timeout")), 50000))
      ]).catch(err => {
        console.warn("AI analysis timed out:", err.message);
        const { status } = getBloodPressureStatus(systolic, diastolic);
        return {
          status,
          suggestion: "Analysis timed out. Please try again later.",
          riskLevel: (systolic > 140 || diastolic > 90) ? 70 : (systolic > 120 || diastolic > 80) ? 40 : 10
        };
      });
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      console.log(`Blood pressure analysis time: ${responseTime}ms`);
      
      res.json(analysis);
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
