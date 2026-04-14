import cors from "cors";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { IndexRoutes } from "./app/routes";

const app = express();

app.use(express.json());
app.use(cors());

//  Routes
app.use("/api/v1", IndexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Tour Management System Backend",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
