// AI Conversational Memory Assistant Engine
import { MOCK_FAMILY_MEMORIES, MOCK_ROUTINE_SCHEDULE, MOCK_ELDERLY_USER } from '../data/mockData';

export const MemoryAssistant = {
  answerQuery: (rawQuery, language = 'as') => {
    const q = rawQuery.toLowerCase().trim();

    for (const mem of MOCK_FAMILY_MEMORIES) {
      const nameMatch = q.includes(mem.name.toLowerCase()) || mem.name.toLowerCase().split(' ')[0].includes(q);
      const relationMatch = mem.relation.toLowerCase().split(' ').some(word => q.includes(word.toLowerCase()));

      if (nameMatch || (relationMatch && q.includes('who'))) {
        return {
          found: true,
          type: 'family',
          title: mem.name,
          subtitle: `Your ${mem.relation}`,
          responseText: `${mem.name} is your ${mem.relation}. ${mem.description}`,
          photoUrl: mem.photoUrl,
          voiceNote: mem.voiceNote,
          favoriteMemory: mem.favoriteMemory,
          suggestedFollowup: `Would you like to play a memory game about ${mem.name}?`
        };
      }
    }

    if (q.includes('medicine') || q.includes('dawai') || q.includes('dawa') || q.includes('pill') || q.includes('ঔষধ')) {
      const meds = MOCK_ROUTINE_SCHEDULE.filter(r => r.category === 'Medication');
      return {
        found: true,
        type: 'medication',
        title: 'Your Daily Medication',
        subtitle: 'Scheduled by Priya Devi',
        responseText: `Your morning Blood Pressure medicine is scheduled at 9:00 AM. Evening multivitamin is at 8:30 PM.`,
        details: meds,
        suggestedFollowup: 'Would you like me to speak your morning medication reminder again?'
      };
    }

    if (q.includes('call') || q.includes('rahul') || q.includes('phone') || q.includes('ফোন')) {
      const rahul = MOCK_FAMILY_MEMORIES.find(m => m.name.includes('Rahul'));
      return {
        found: true,
        type: 'family_call',
        title: 'Rahul Sharma (Son)',
        subtitle: 'Calls at 6:00 PM',
        responseText: `Your son Rahul calls you every evening from Tezpur around 6:00 PM. ${rahul ? rahul.description : ''}`,
        photoUrl: rahul ? rahul.photoUrl : null,
        suggestedFollowup: 'Tap below if you want to call Rahul now.'
      };
    }

    if (q.includes('where') || q.includes('live') || q.includes('house') || q.includes('home') || q.includes('ক\'ত')) {
      return {
        found: true,
        type: 'location',
        title: 'Guwahati, Assam',
        subtitle: 'Your Peaceful Home',
        responseText: `You live in Guwahati, Assam with your daughter Priya. Your verandah garden has beautiful orchids and marigolds.`,
        photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=80',
        suggestedFollowup: 'Would you like to hear a relaxing sound of morning tea on your verandah?'
      };
    }

    return {
      found: false,
      type: 'general',
      title: `Namaskar ${MOCK_ELDERLY_USER.name}!`,
      subtitle: 'AI Memory Companion',
      responseText: `I am your memory companion! You can ask me about your granddaughter Ananya, your son Rahul, your daily medicines, or your Bihu memories.`,
      suggestedFollowup: 'Try asking: "Who is Ananya?" or "What medicine do I take?"'
    };
  }
};
