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
    const response = await fetch(`${baseUrl}/games/${gameId}`, { cache: 'no-store' });

    // Read once as text then parse — handles status 0 (ERR_CACHE_READ_FAILURE)
    const rawText = await response.text().catch(() => '');
    let data = null;
    try { data = JSON.parse(rawText); } catch { data = null; }

    // status 0 with valid JSON body = corrupted browser cache — still usable
    if (!data || (!response.ok && response.status !== 0)) {
      gameCache.set(key, null);
      return null;
    }
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

// ---------------------------------------------------------------------------
// Image utilities
// ---------------------------------------------------------------------------

/** Placeholder used whenever an image is missing or fails to load */
export const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/1f2937/9ca3af?text=No+Image';

/**
 * Resolve a safe image URL from a game's images array.
 * Falls back to the placeholder if the array is empty or the index is out of bounds.
 *
 * @param {string[]|undefined} images  - Array of image URL strings
 * @param {number}             index   - Which image to pick (default 0)
 * @returns {string} A valid image URL or the placeholder
 */
export const getImageUrl = (images, index = 0) => {
  if (!Array.isArray(images) || images.length === 0) return PLACEHOLDER_IMAGE;
  const url = images[index];
  if (!url || typeof url !== 'string' || url.trim() === '') return PLACEHOLDER_IMAGE;
  return url.trim();
};

/**
 * onError handler for <img> elements.
 * Swaps the broken src for the placeholder and removes the handler
 * so it does not fire again if the placeholder itself fails.
 *
 * Usage:  <img src={...} onError={handleImageError} />
 */
export const handleImageError = (e) => {
  e.currentTarget.onerror = null;           // prevent infinite loop
  e.currentTarget.src = PLACEHOLDER_IMAGE;
};

// ---------------------------------------------------------------------------

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