import axios from "axios";

const configuredApiUrl =
	import.meta.env.VITE_API_URL ||
	"https://relifenotify-backend-orig-production.up.railway.app/api";

export const API_URL = configuredApiUrl.replace(/\/$/, "");

export default axios.create({
	baseURL: API_URL,
});
