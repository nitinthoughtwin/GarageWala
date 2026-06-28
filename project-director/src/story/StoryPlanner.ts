// =============================================================
// Story Planner — Procedural AI Director Layer (Phase 6)
// Dynamically generates a multi-scene StoryPlan for ANY custom prompt.
// Extracts layout keys, character species, and writes tailored dialogues.
// =============================================================

import type { StoryPlan, SceneDescription } from '../types';

export class StoryPlanner {
  plan(prompt: string): StoryPlan {
    console.log('[StoryPlanner] Dynamically planning story for custom prompt:', prompt);

    const lp = prompt.toLowerCase();

    // 1. Resolve family species
    let familyKey: 'cat' | 'rabbit' | 'both' = 'cat';
    if (lp.includes('rabbit') && lp.includes('cat')) {
      familyKey = 'both';
    } else if (lp.includes('rabbit')) {
      familyKey = 'rabbit';
    }

    // Resolve characters involved
    const characters = this.resolveCharacters(familyKey);

    // 2. Select narrative flow/template based on layout keywords
    let flow = 'default';
    if (lp.includes('school') || lp.includes('class') || lp.includes('learn') || lp.includes('teacher')) {
      flow = 'school';
    } else if (lp.includes('cricket') || lp.includes('garden') || lp.includes('sport') || lp.includes('play')) {
      flow = 'cricket';
    } else if (lp.includes('birthday') || lp.includes('party') || lp.includes('celebrate') || lp.includes('cake')) {
      flow = 'birthday';
    } else if (lp.includes('market') || lp.includes('bazaar') || lp.includes('shop') || lp.includes('buy') || lp.includes('apple')) {
      flow = 'market';
    } else if (lp.includes('park') || lp.includes('picnic') || lp.includes('bench') || lp.includes('swing') || lp.includes('pond')) {
      flow = 'park';
    } else if (lp.includes('breakfast') || lp.includes('kitchen') || lp.includes('cook') || lp.includes('eat')) {
      flow = 'breakfast';
    }

    // 3. Build scenes procedurally
    const scenes = this.buildScenesForFlow(flow, characters, prompt);

    const title = this.generateTitle(prompt, familyKey, flow);

    return {
      title,
      scenes,
    };
  }

  private resolveCharacters(family: 'cat' | 'rabbit' | 'both'): string[] {
    const cats = ['PapaCat', 'MamaCat', 'KidCat', 'GrandpaCat', 'BabyCat'];
    const rabbits = ['PapaRabbit', 'MamaRabbit', 'KidRabbit'];

    if (family === 'rabbit') return rabbits;
    if (family === 'both') return ['PapaCat', 'MamaCat', 'KidCat', 'PapaRabbit', 'KidRabbit'];
    return cats; // default
  }

  private generateTitle(_prompt: string, family: string, flow: string): string {
    // Capitalize prompt or make a clean title
    const who = family === 'both' ? 'Cats & Rabbits' : family === 'rabbit' ? 'Rabbit Family' : 'Cat Family';
    let what = 'Daily Adventure';
    if (flow === 'school') what = 'Goes to School';
    if (flow === 'cricket') what = 'Cricket Tournament';
    if (flow === 'birthday') what = 'Birthday Celebration';
    if (flow === 'market') what = 'Shopping Day';
    if (flow === 'park') what = 'Picnic in the Park';
    if (flow === 'breakfast') what = 'Morning Breakfast';

    return `${who}'s ${what}`;
  }

  private buildScenesForFlow(
    flow: string,
    characters: string[],
    prompt: string
  ): SceneDescription[] {
    // Pick characters for speaker roles
    const papa = characters.find(c => c.includes('Papa')) || characters[0];
    const mama = characters.find(c => c.includes('Mama')) || characters[0];
    const kid = characters.find(c => c.includes('Kid')) || characters[0];

    const scenes: SceneDescription[] = [];

    if (flow === 'school') {
      scenes.push({
        id: 'dyn-s1',
        name: 'Living Room',
        description: `Preparing for school day. ${prompt}`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'Hurry up kids! Pack your bags for school!', start: 1.5, end: 4.5 },
          { characterId: kid, text: 'Yes mom, I am putting my books in my bag!', start: 5, end: 8 },
        ]
      });
      scenes.push({
        id: 'dyn-s2',
        name: 'School',
        description: `Classroom lesson and learning math.`,
        durationHint: 12,
        transition: 'iris',
        characterIds: characters.filter(c => !c.includes('Papa') && !c.includes('Baby') && !c.includes('Grandpa')), // kids + teacher
        dialogues: [
          { characterId: mama, text: 'Today we will learn math. Who knows what two plus three is?', start: 1, end: 5.5 },
          { characterId: kid, text: 'Teacher! I know! The answer is five!', start: 6.5, end: 9.5 },
        ]
      });
      scenes.push({
        id: 'dyn-s3',
        name: 'Park',
        description: `Recess playtime at the playground swings.`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: kid, text: 'Yay! School is over, let us play on the swings!', start: 2, end: 5.5 },
          { characterId: papa, text: 'Have fun kids, but be careful near the pond!', start: 6, end: 9 },
        ]
      });
    } else if (flow === 'cricket') {
      scenes.push({
        id: 'dyn-s1',
        name: 'Living Room',
        description: `Discussing game plan for cricket. ${prompt}`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: papa, text: 'Let us go play a cricket match in the garden!', start: 1.5, end: 5 },
          { characterId: kid, text: 'Awesome! I want to bat first, Papa!', start: 5.5, end: 8.5 },
        ]
      });
      scenes.push({
        id: 'dyn-s2',
        name: 'Garden',
        description: `The exciting cricket match at the pitch.`,
        durationHint: 12,
        transition: 'iris',
        characterIds: characters.filter(c => c.includes('Papa') || c.includes('Mama') || c.includes('Kid')),
        dialogues: [
          { characterId: mama, text: 'Get ready batsman! Here comes a fast ball!', start: 2, end: 5 },
          { characterId: papa, text: 'Watch out! I am going to hit a huge sixer!', start: 6, end: 9 },
        ]
      });
      scenes.push({
        id: 'dyn-s3',
        name: 'Park',
        description: `Celebrating the victory with a picnic.`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: kid, text: 'That was an amazing game! We won the trophy!', start: 2, end: 5.5 },
          { characterId: mama, text: 'Time for some fresh juice and relaxation in the park.', start: 6, end: 9.5 },
        ]
      });
    } else if (flow === 'birthday') {
      scenes.push({
        id: 'dyn-s1',
        name: 'Market',
        description: `Buying cake and decorations at the market. ${prompt}`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'We need to buy balloons and a fresh cake for the birthday party!', start: 1.5, end: 5 },
          { characterId: papa, text: 'I will buy some gift boxes from the vendor stall.', start: 5.5, end: 8.5 },
        ]
      });
      scenes.push({
        id: 'dyn-s2',
        name: 'Living Room',
        description: `Decorating the living room with balloons.`,
        durationHint: 10,
        transition: 'iris',
        characterIds: characters,
        dialogues: [
          { characterId: kid, text: 'Let us hang the colorful birthday banners here!', start: 2, end: 5 },
          { characterId: mama, text: 'It looks so beautiful, you kids did a great job!', start: 5.5, end: 8.5 },
        ]
      });
      scenes.push({
        id: 'dyn-s3',
        name: 'Birthday Party',
        description: `Blowing candles and eating birthday cake.`,
        durationHint: 12,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: papa, text: 'Happy Birthday! Make a wish and blow the candles!', start: 2, end: 5.5 },
          { characterId: kid, text: 'Thank you, everyone! I wish for a big box of fish toys!', start: 6, end: 9.5 },
        ]
      });
    } else if (flow === 'market') {
      scenes.push({
        id: 'dyn-s1',
        name: 'Living Room',
        description: `Writing shopping list. ${prompt}`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'Let us write down a shopping list of all the groceries we need.', start: 1.5, end: 5 },
          { characterId: kid, text: 'Can we also buy some sweet red apples from the market?', start: 5.5, end: 8.5 },
        ]
      });
      scenes.push({
        id: 'dyn-s2',
        name: 'Market',
        description: `Buying groceries at market bazaar.`,
        durationHint: 12,
        transition: 'iris',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'Fresh red apples here! Buy one basket get one free!', start: 1.5, end: 5 },
          { characterId: papa, text: 'Perfect! We will take one basket and a blue umbrella, please.', start: 5.5, end: 9 },
        ]
      });
      scenes.push({
        id: 'dyn-s3',
        name: 'Kitchen',
        description: `Unpacking food in the kitchen.`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'Let us wash these fresh apples and prepare a snack.', start: 2, end: 5 },
          { characterId: kid, text: 'Yum! These apples look so sweet and juicy!', start: 5.5, end: 8.5 },
        ]
      });
    } else if (flow === 'park') {
      scenes.push({
        id: 'dyn-s1',
        name: 'Living Room',
        description: `Packing bags for picnic. ${prompt}`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'We are going on a family picnic today. Let us pack the food!', start: 1.5, end: 5 },
          { characterId: kid, text: 'Yay! I want to bring my toys to play in the park!', start: 5.5, end: 8.5 },
        ]
      });
      scenes.push({
        id: 'dyn-s2',
        name: 'Park',
        description: `Enjoying swing and pond in the park.`,
        durationHint: 12,
        transition: 'iris',
        characterIds: characters,
        dialogues: [
          { characterId: kid, text: 'Wheee! Look at me swing so high in the air!', start: 2, end: 5 },
          { characterId: papa, text: 'What a beautiful day. The weather is so pleasant!', start: 6, end: 9 },
        ]
      });
      scenes.push({
        id: 'dyn-s3',
        name: 'Bedtime',
        description: `Tired kids sleeping after picnic.`,
        durationHint: 8,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'Go to sleep now, you must be very tired after the picnic.', start: 1.5, end: 4.5 },
          { characterId: kid, text: 'Yes mom, goodnight... zzz', start: 5, end: 7.5 },
        ]
      });
    } else {
      // Default: Breakfast flow
      scenes.push({
        id: 'dyn-s1',
        name: 'Kitchen',
        description: `Cooking and eating breakfast. ${prompt}`,
        durationHint: 10,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'Breakfast is ready! Come eat some hot pancakes!', start: 1.5, end: 4.5 },
          { characterId: papa, text: 'Smells delicious, dear! I am sitting at the table.', start: 5, end: 8 },
        ]
      });
      scenes.push({
        id: 'dyn-s2',
        name: 'Living Room',
        description: `Chatting in the living room.`,
        durationHint: 10,
        transition: 'iris',
        characterIds: characters,
        dialogues: [
          { characterId: kid, text: 'What should we play today? Let us dance together!', start: 2, end: 5 },
          { characterId: papa, text: 'That sounds like a great plan. Let us put on some music!', start: 5.5, end: 8.5 },
        ]
      });
      scenes.push({
        id: 'dyn-s3',
        name: 'Bedtime',
        description: `Bedtime sleep sequence.`,
        durationHint: 8,
        transition: 'fade',
        characterIds: characters,
        dialogues: [
          { characterId: mama, text: 'Bedtime, children! Close your eyes and dream.', start: 1.5, end: 4.5 },
          { characterId: kid, text: 'Goodnight mom, goodnight dad!', start: 5, end: 7.5 },
        ]
      });
    }

    return scenes;
  }

  formatStoryText(plan: StoryPlan): string {
    const lines: string[] = [`📖 ${plan.title}`, ''];
    plan.scenes.forEach((scene, i) => {
      lines.push(`Scene ${i + 1}: ${scene.name} (${scene.transition || 'cut'} transition)`);
      lines.push(scene.description);
      lines.push(`Duration: ${scene.durationHint}s`);
      lines.push('');
    });
    return lines.join('\n');
  }
}
