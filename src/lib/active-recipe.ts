export type ActiveRecipe = {
  name: string;
  description: string;
  timeMinutes: number;
  difficulty: string;
  calories: number;
  servings: number;
  usedIngredients: string[];
  missingIngredients: string[];
  steps: string[];
};

const KEY = "oshpaz:active-recipe";

export function saveActiveRecipe(recipe: ActiveRecipe) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(recipe));
  } catch {
    // ignore quota errors
  }
}

export function loadActiveRecipe(): ActiveRecipe | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveRecipe;
  } catch {
    return null;
  }
}

export function clearActiveRecipe() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
