const normalizeBaseUrl = (value) => value?.replace(/\/$/, "");

const ensureProtocol = (value) => {
	if (!value) return null;
	if (/^https?:\/\//i.test(value)) return value;
	if (/^(localhost|127\.0\.0\.1)(:\d+)?/i.test(value)) return `http://${value}`;
	return `https://${value}`;
};

const withApiPrefix = (value) => {
	if (!value) return null;
	const absoluteValue = ensureProtocol(value);
	return absoluteValue.endsWith("/api") ? absoluteValue : `${absoluteValue}/api`;
};

const resolveBaseUrl = () => withApiPrefix(normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || null));

export const BaseUrl = resolveBaseUrl();

const gameCache = new Map();
let cacheInvalidationCounter = 0;

export const invalidateGameCache = (gameId) => {
  if (gameId) {
    gameCache.delete(String(gameId));
  } else {
    gameCache.clear();
  }
  cacheInvalidationCounter++;
};

export const fetchWithGameCache = async (baseUrl, gameId) => {
  const key = String(gameId);
  if (gameCache.has(key)) {
    return gameCache.get(key);
  }
  try {
    const response = await fetch(`${baseUrl}/games/${gameId}`);
    if (!response.ok) {
      gameCache.set(key, null);
      return null;
    }
    const data = await response.json();
    const normalized = normalizeGame(data);
    gameCache.set(key, normalized);
    return normalized;
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
};

export const getStoredAuth = () => {
	if (typeof window === 'undefined' || !window.localStorage) return null;
	let raw = null;
	try {
		raw = localStorage.getItem("gameHubAuth");
	} catch {
		return null;
	}
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		try { localStorage.removeItem("gameHubAuth"); } catch { /* ignore parse errors */ }
		return null;
	}
};

export const setStoredAuth = (auth) => {
	if (typeof window === 'undefined' || !window.localStorage) return;
	try {
		if (!auth) {
			localStorage.removeItem("gameHubAuth");
			return;
		}
		const toStore = auth.user
			? {
				user: {
					...auth.user,
					accessToken: undefined,
				},
			}
			: auth;
		localStorage.setItem("gameHubAuth", JSON.stringify(toStore));
	} catch {
		// Fail silently (quota or access issues), caller may log in development.
	}
};

export const buildAuthHeaders = (token) =>
	token ? { Authorization: `Bearer ${token}` } : {};

export const normalizeGame = (game) => {
  if (!game) return null;

  const images = game.imageUrls || game.images || [];
  const normalizedImages = Array.isArray(images)
    ? images
    : (images ? [images] : []);

  return {
    id: game.id,
    name: game.name,
    genre: game.genre,
    platform: game.platform,
    price: game.price,
    rating: game.rating,
    inStock: game.inStock,
    trailer: game.trailerUrl || game.trailer || "",
    images: normalizedImages,
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