import express from "express";
import isAuth from "../middleware/isAuth";

import * as SubscriptionController from "../controllers/SubscriptionController";

const subscriptionRoutes = express.Router();
// @ts-ignore
subscriptionRoutes.post("/subscription", isAuth, SubscriptionController.createSubscription);
// @ts-ignore
subscriptionRoutes.post("/subscription/create/webhook", SubscriptionController.createWebhook);
// @ts-ignore
subscriptionRoutes.post("/subscription/webhook/:type?", SubscriptionController.webhook);

export default subscriptionRoutes;
