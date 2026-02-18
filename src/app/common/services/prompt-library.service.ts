import {Injectable, signal} from '@angular/core';
import {ChatMessage, MessageRole} from '../../components/chat-drawer/chat-interface/chat.models';

export interface PredefinedPrompt {
  id: string;
  title: string;
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromptLibraryService {
  private readonly prompts = signal<PredefinedPrompt[]>([]);

  constructor() {
    const p1Id = 'a1b2c3d4-e5f6-7890-1111-222233334444';
    const p2Id = crypto.randomUUID();
    const p3Id = crypto.randomUUID();

    this.prompts.set([
      {
        id: p1Id,
        title: 'Slime — Top Characters',
        question: 'Who are the top characters in Slime?',
        answer: `Top characters in Slime:\n\n<chart>{
        "type": "bar",
        "title": "Slime - Popularity",
        "data": [
          {"name": "Rimuru", "value": 100},
          {"name": "Veldora", "value": 85},
          {"name": "Milim", "value": 75},
          {"name": "Benimaru", "value": 70}
        ]
      }
      </chart>\n\nRimuru is widely regarded as the most central character.`
      },
      {
        id: p2Id,
        title: 'Attack on Titan — Titans Overview',
        question: 'What are the main Titans and their roles?',
        answer: `Short overview of major Titans.\n\n<chart>{
        "type": "bar",
        "title": "Titan Impact",
        "data": [
          {"name": "Founding", "value": 100},
          {"name": "Attack", "value": 90},
          {"name": "Colossus", "value": 85},
          {"name": "Armored", "value": 80}
        ]
      }
      </chart>\n\nFounding Titan has the largest narrative impact.`
      },
      {
        id: p3Id,
        title: 'Jujutsu Kaisen — Most Popular Characters',
        question: 'Who are the most popular characters in Jujutsu Kaisen?',
        answer: `Top picks from community polls.\n\n<chart>{
        "type": "line",
        "title": "JJK - Popularity",
        "data": [
          {"name": "Satoru Gojo", "value": 100},
          {"name": "Nanami Kento", "value": 200},
          {"name": "Yuji Itadori", "value": 140},
          {"name": "JoGoat", "value": 120},
          {"name": "Sukuna", "value": 95},
          {"name": "Megumi", "value": 80},
          {"name": "Nobara", "value": 75}
        ]
      }
      </chart>\n\nGojo and Sukuna consistently rank at the top.`
      }
    ]);
  }

  getPromptsValue() {
    return this.prompts();
  }

  getMessagesForPrompt(promptId: string): ChatMessage[] {
    const prompt = this.prompts().find(p => p.id === promptId);
    if (!prompt) return [];

    return [
      {
        id: crypto.randomUUID(),
        message: prompt.question,
        timestamp: new Date(),
        isUser: true,
        role: MessageRole.User
      },
      {
        id: crypto.randomUUID(),
        message: prompt.answer,
        timestamp: new Date(),
        isUser: false,
        role: MessageRole.Assistant,
        charts: [],
        tables: []
      }
    ];
  }
}
