import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_URL = configuredApiUrl.replace(/\/$/, "");

export default axios.create({
	baseURL: API_URL,
});
