// firebase-init.js - Development mode with localStorage mock
const firebaseConfig = {
  apiKey: "AIzaSyDHU8jD37Qe6eFQSeTAvVe-i99NdGbDouY",
  authDomain: "skill-assement-engine.firebaseapp.com",
  projectId: "skill-assement-engine",
  storageBucket: "skill-assement-engine.firebasestorage.app",
  messagingSenderId: "102187548819",
  appId: "1:102187548819:web:97cbce88e35b896b1c0d66",
  measurementId: "G-1BWKJNNMV0"
};
// Import mock Firebase services for development
import { mockFirestore, mockDb, initializeMockData } from './local-storage-mock.js';

// Initialize mock data
// initializeMockData(); // Disabled - using seedSampleData instead

// Use mock services for development
const app = { _isMock: true };
const db = mockDb;

// Export mock services
export { app, db };

// Export mock Firestore functions
export const {
    collection,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    doc
} = mockFirestore;