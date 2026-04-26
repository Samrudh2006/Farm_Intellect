import crypto from 'crypto';

const seedPolls = [
  {
    id: "poll-1",
    title: "Best Crop for Rabi Season 2024",
    description: "Help fellow farmers decide which crop has the best potential for the upcoming Rabi season based on market trends and weather predictions.",
    category: "crop_selection",
    status: "active",
    creator: "Agricultural Expert Dr. Patel",
    createdAt: "2024-03-10",
    endDate: "2024-03-25",
    region: "Maharashtra",
    options: [
      { id: "poll-1a", text: "Wheat", votes: 89 },
      { id: "poll-1b", text: "Barley", votes: 56 },
      { id: "poll-1c", text: "Chickpea", votes: 67 },
      { id: "poll-1d", text: "Mustard", votes: 22 }
    ]
  },
  {
    id: "poll-2",
    title: "Fair Price for Tomatoes This Season",
    description: "What do you think is a fair price for tomatoes considering current market conditions?",
    category: "pricing",
    status: "active",
    creator: "Farmers Collective Pune",
    createdAt: "2024-03-12",
    endDate: "2024-03-20",
    region: "Maharashtra",
    options: [
      { id: "poll-2a", text: "₹20-25 per kg", votes: 62 },
      { id: "poll-2b", text: "₹25-30 per kg", votes: 47 },
      { id: "poll-2c", text: "₹30-35 per kg", votes: 31 },
      { id: "poll-2d", text: "Above ₹35 per kg", votes: 16 }
    ]
  },
  {
    id: "poll-3",
    title: "Most Effective Organic Fertilizer",
    description: "Share your experience with organic fertilizers. Which one has given you the best results?",
    category: "technique",
    status: "active",
    creator: "Green Farming Initiative",
    createdAt: "2024-03-08",
    endDate: "2024-03-30",
    region: "All India",
    options: [
      { id: "poll-3a", text: "Vermicompost", votes: 34 },
      { id: "poll-3b", text: "FYM (Farm Yard Manure)", votes: 28 },
      { id: "poll-3c", text: "Compost", votes: 19 },
      { id: "poll-3d", text: "Bio-fertilizer", votes: 8 }
    ]
  },
  {
    id: "poll-4",
    title: "Cotton Market Outlook",
    description: "How do you see the cotton market performing in the next 6 months?",
    category: "market_trend",
    status: "completed",
    creator: "Cotton Association of India",
    createdAt: "2024-02-15",
    endDate: "2024-03-01",
    region: "All India",
    options: [
      { id: "poll-4a", text: "Prices will increase", votes: 165 },
      { id: "poll-4b", text: "Prices will remain stable", votes: 124 },
      { id: "poll-4c", text: "Prices will decrease", votes: 82 },
      { id: "poll-4d", text: "Uncertain/Volatile", votes: 41 }
    ]
  }
];

const enrichPoll = (poll) => {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  return {
    ...poll,
    totalVotes,
    options: poll.options.map((option) => ({
      ...option,
      percentage: totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0
    }))
  };
};

let polls = seedPolls.map(enrichPoll);

export const listPolls = () => polls.map(enrichPoll);

export const createPoll = ({ title, description, category, options, endDate, region, creator }) => {
  const id = `poll-${crypto.randomUUID()}`;
  const poll = {
    id,
    title,
    description,
    category,
    status: "active",
    creator,
    createdAt: new Date().toISOString().slice(0, 10),
    endDate,
    region,
    options: options.map((text, index) => ({
      id: `${id}-opt-${index + 1}`,
      text,
      votes: 0
    }))
  };
  polls = [enrichPoll(poll), ...polls];
  return enrichPoll(poll);
};

export const votePoll = ({ pollId, optionId }) => {
  const pollIndex = polls.findIndex((p) => p.id === pollId);
  if (pollIndex === -1) return null;
  const poll = polls[pollIndex];
  const option = poll.options.find((opt) => opt.id === optionId);
  if (!option) return null;
  option.votes += 1;
  polls[pollIndex] = enrichPoll({ ...poll, options: poll.options });
  return polls[pollIndex];
};
