import Sentiment from 'sentiment';
import * as toxicity from '@tensorflow-models/toxicity';
import { removeStopwords, eng } from 'stopword';

const sentiment = new Sentiment();
let toxicityModel: any = null;

export interface CommentAnalysis {
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
  };
  toxicity: {
    toxic: boolean;
    severeToxic: boolean;
    obscene: boolean;
    threat: boolean;
    insult: boolean;
    identityHate: boolean;
  } | null;
  wordFrequency: { [key: string]: number };
  topics: string[];
}

export const analyzeSentiment = (text: string) => {
  return sentiment.analyze(text);
};

export const initToxicityModel = async () => {
  if (!toxicityModel) {
    const threshold = 0.9;
    toxicityModel = await toxicity.load(threshold);
  }
  return toxicityModel;
};

export const analyzeToxicity = async (text: string) => {
  const model = await initToxicityModel();
  const predictions = await model.classify(text);
  
  return {
    toxic: predictions[0].results[0].match,
    severeToxic: predictions[1].results[0].match,
    obscene: predictions[2].results[0].match,
    threat: predictions[3].results[0].match,
    insult: predictions[4].results[0].match,
    identityHate: predictions[5].results[0].match,
  };
};

export const getWordFrequency = (text: string) => {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/);
  
  const filteredWords = removeStopwords(words, eng);
  
  return filteredWords.reduce((acc: { [key: string]: number }, word) => {
    if (word.length > 2) { // Only count words longer than 2 characters
      acc[word] = (acc[word] || 0) + 1;
    }
    return acc;
  }, {});
};

export const extractTopics = (text: string) => {
  const words = text.toLowerCase()
    .match(/#\w+/g) || [];
  
  return Array.from(new Set(words));
};

export const analyzeComment = async (text: string): Promise<CommentAnalysis> => {
  const sentimentResult = analyzeSentiment(text);
  const toxicityResult = await analyzeToxicity(text);
  const wordFrequency = getWordFrequency(text);
  const topics = extractTopics(text);

  return {
    sentiment: {
      score: sentimentResult.score,
      comparative: sentimentResult.comparative,
      positive: sentimentResult.positive,
      negative: sentimentResult.negative,
    },
    toxicity: toxicityResult,
    wordFrequency,
    topics,
  };
};
