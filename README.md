# The Anatomist's Laboratory

An escape room-style educational game for learning head anatomy at the medical school level.

## 🎮 About the Game

Master the anatomy of the human head through puzzles, challenges, and clinical mysteries. This game is designed for medical students, dental students, and anyone studying head anatomy.

### Features

- **Study Mode**: Interactive flashcards with clinical notes and mnemonics
- **Escape Room Puzzles**: Solve anatomical riddles to unlock chambers
- **Progress Tracking**: Mastery system ensures you truly learn the material
- **Spaced Repetition**: Review structures over time for better retention
- **Clinical Context**: Real-world applications of anatomical knowledge

### Content Covered

- 🦴 **Bones**: Cranial and facial bones, sutures, foramina
- 💪 **Muscles**: Mastication and facial expression
- 🔴 **Vessels**: Arteries and veins of the head
- ⚡ **Nerves**: Cranial nerves and their distributions
- 🏥 **Clinical**: Applied anatomy and patient scenarios

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/anatomists-laboratory.git
cd anatomists-laboratory

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

1. Update `homepage` in `package.json` with your GitHub Pages URL:
   ```json
   "homepage": "https://yourusername.github.io/anatomists-laboratory"
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## 📚 How the Learning System Works

### The Learning Loop

1. **Explore**: Interactive anatomy atlas
2. **Study**: Focused flashcards with key information
3. **Practice**: Low-stakes puzzles to test understanding
4. **Challenge**: Escape room puzzles for assessment
5. **Reinforce**: Spaced review of previous content

### Triple Verification for Mastery

For a structure to be marked as "Mastered", you must:
- ✅ **Recognize** it (identify when shown) - 2 times
- ✅ **Recall** it (name from description) - 2 times  
- ✅ **Apply** it (use in clinical scenario) - 1 time

### Star Rating

- ⭐ Complete the room (60%+ accuracy)
- ⭐⭐ Good performance (80%+ accuracy)
- ⭐⭐⭐ Perfect performance (95%+ accuracy, no hints)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Framer Motion** - Animations
- **LocalStorage** - Progress persistence
- **GitHub Pages** - Hosting

## 📁 Project Structure

```
src/
├── components/
│   ├── TitleScreen.js      # Landing page
│   ├── Laboratory.js       # Room selection hub
│   ├── StudyMode.js        # Flashcard study system
│   ├── Room.js             # Escape room wrapper
│   ├── ProgressDashboard.js # Stats and mastery tracking
│   └── puzzles/
│       └── BonesPuzzles.js # Bone room puzzles
├── context/
│   └── GameContext.js      # Global state management
├── data/
│   ├── bones.js            # Skull bones, foramina, landmarks
│   └── muscles.js          # Muscles of head
└── App.js                  # Main app component
```

## 🎯 Roadmap

- [x] Bones room with puzzles
- [x] Study mode with flashcards
- [x] Progress tracking system
- [ ] Muscles room puzzles
- [ ] Vessels room puzzles
- [ ] Nerves room puzzles
- [ ] Clinical cases room
- [ ] Interactive skull diagrams
- [ ] Sound effects and music
- [ ] Mobile optimization

## 📖 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Adding New Content

1. Add anatomical data to `src/data/`
2. Create puzzle components in `src/components/puzzles/`
3. Register the room in `Room.js`

## 📄 License

MIT License - feel free to use for educational purposes.

## 🙏 Acknowledgments

- Anatomical content based on standard medical school curricula
- Inspired by escape room game mechanics
- Built with love for anatomy education
