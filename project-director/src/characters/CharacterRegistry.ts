// =============================================================
// Character Registry — Unifies Cat and Rabbit Families
// Provides profiles, colors, scales, and factory function.
// =============================================================

import type { CharacterProfile, CharacterState, CharacterColors, CharacterSpecies } from '../types';
import { CAT_COLORS, CAT_SCALES, CAT_PROFILES } from './CatFamily';
import { RABBIT_COLORS, RABBIT_SCALES, RABBIT_PROFILES } from './RabbitFamily';

// Expose all profiles
export const ALL_CHARACTER_PROFILES: CharacterProfile[] = [
  ...CAT_PROFILES,
  ...RABBIT_PROFILES,
];

// Unified colors mapping
export const ALL_CHARACTER_COLORS: Record<string, CharacterColors> = {
  ...CAT_COLORS,
  ...RABBIT_COLORS,
  // backward compatibility for Phase 1
  Papa: CAT_COLORS.PapaCat,
  Mama: CAT_COLORS.MamaCat,
  Kid: CAT_COLORS.KidCat,
};

// Unified scales mapping
export const ALL_CHARACTER_SCALES: Record<string, number> = {
  ...CAT_SCALES,
  ...RABBIT_SCALES,
  // backward compatibility for Phase 1
  Papa: CAT_SCALES.PapaCat,
  Mama: CAT_SCALES.MamaCat,
  Kid: CAT_SCALES.KidCat,
};

// Unified species lookup
export function getCharacterSpecies(id: string): CharacterSpecies {
  const profile = ALL_CHARACTER_PROFILES.find(p => p.id === id);
  if (profile) return profile.species;
  
  // Backward compatibility
  if (['Papa', 'Mama', 'Kid'].includes(id)) return 'cat';
  
  return 'cat'; // default fallback
}

// Unified display name lookup
export function getCharacterDisplayName(id: string): string {
  const profile = ALL_CHARACTER_PROFILES.find(p => p.id === id);
  if (profile) return profile.displayName;
  return id;
}

// Unified factory to build initial CharacterState
export function createCharacterStateFromRegistry(
  id: string,
  position: { x: number; y: number }
): CharacterState {
  const colors = ALL_CHARACTER_COLORS[id] ?? CAT_COLORS.PapaCat;
  const scale = ALL_CHARACTER_SCALES[id] ?? 1.0;
  const species = getCharacterSpecies(id);

  return {
    id,
    species,
    position: { ...position },
    currentAnimation: 'idle',
    animationProgress: 0,
    facingRight: !id.toLowerCase().includes('mama'), // default facing left for moms, right for others
    color: colors,
    scale,
  };
}
