import config from "@/config/config";
import { v2 } from "cloudinary";

const cloudinary = v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export default cloudinary;