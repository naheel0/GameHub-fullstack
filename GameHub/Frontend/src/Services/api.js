const normalizeBaseUrl = (value) => value?.replace(/\/$/, "");

const withApiPrefix = (value) => {
	if (!value) return null;
	return value.endsWith("/api") ? value : `${value}/api`;
};

const resolveBaseUrl = () => withApiPrefix(normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || null));

export const BaseUrl = resolveBaseUrl();

export const getStoredAuth = () => {
	const raw = localStorage.getItem("gameHubAuth");
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch (error) {
		console.debug("Failed to parse auth cache:", error);
		localStorage.removeItem("gameHubAuth");
		return null;
	}
};

export const setStoredAuth = (auth) => {
	if (!auth) {
		localStorage.removeItem("gameHubAuth");
		return;
	}
	localStorage.setItem("gameHubAuth", JSON.stringify(auth));
};

export const buildAuthHeaders = (token) =>
	token ? { Authorization: `Bearer ${token}` } : {};

export const normalizeGame = (game) => {
	if (!game) return null;

	return {
		id: game.id,
		name: game.name,
		genre: game.genre,
		platform: game.platform,
		price: game.price,
		rating: game.rating,
		inStock: game.inStock,
		trailer: game.trailerUrl || game.trailer || "",
		images: game.imageUrls || game.image || game.images || [],
		description: game.description || "",
	};
};

export const normalizeUser = (data, accessToken) => {
	if (!data) return null;

	return {
		id: data.id,
		firstName: data.firstName,
		lastName: data.lastName,
		email: data.email,
		phone: data.phone,
		role: (data.role || "user").toLowerCase(),
		status: (data.status || "active").toLowerCase(),
		accessToken: accessToken || data.accessToken || "",
	};
};