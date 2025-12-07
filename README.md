# 🎢 Seesaw Simulation

Interactive physics simulation of a seesaw. A web application that visualizes torque and balance calculations by placing weights on a seesaw.

## ✨ Features

- **Interactive Weight Placement**: Click on the seesaw to add weights
- **Physics Calculations**: Real-time torque and angle calculations
- **Dynamic Visualization**: Seesaw angle automatically calculated based on weights (-30° to +30°)
- **Weight Management**: 
  - Each weight is generated with random values between 1-10 kg
  - Ability to remove weights
  - Weight history tracking with logs
- **State Persistence**: Session state saved with LocalStorage
- **Responsive Design**: Works seamlessly on mobile and desktop devices
- **Modern UI**: Clean and user-friendly interface

## 🚀 Installation

1. Clone the project:
```bash
git clone https://github.com/aleynakara16/seesaw-project.git
cd seesaw
```

2. No dependencies required! Just a web browser is enough.

3. Open the `index.html` file in your browser.

## 📖 Usage

1. **Adding Weights**: Click on the seesaw to add weights.

2. **Removing Weights**: Click the "×" button that appears when you hover over a weight to remove it.

3. **Reset**: Click the "Reset" button in the left panel to clear all weights.

4. **Information Panel**: 
   - Total weight values on left and right sides
   - Current seesaw angle
   - Next weight value to be added
   - Weight history in the left panel

## 🔧 Technologies

- **HTML5**: Structural skeleton
- **CSS3**: Styling and animations
- **Vanilla JavaScript**: All functionality and physics calculations

## 📐 Physics Calculations

### Torque Calculation
Total torque for each side is calculated using the following formula:
```
Torque = Σ(weight × distance)
```

### Angle Calculation
Seesaw angle is calculated using the following formula:
```
Angle = max(-30°, min(30°, (rightTorque - leftTorque) / 10))
```

## 📁 Project Structure

```
seesaw/
├── index.html      # Main HTML file
├── styles.css      # Stylesheet
├── app.js          # JavaScript logic and physics calculations
└── README.md       # Project documentation
```

## 🎨 Feature Details

- **Weight Sizing**: Dynamic sizing based on weight value (30px - 65px)
- **Color Palette**: Different color for each weight value
- **Smooth Animations**: Seesaw rotation and weight addition animations
- **Cursor Indicator**: Visual indicator showing mouse position
- **LocalStorage**: State persists when page is refreshed

## 📝 License

This project is open source and free to use.

## 💭 Thought Process & Design Decisions

### Architecture Choices

**Vanilla JavaScript Approach**: I chose to build this project using pure JavaScript without any frameworks. This decision was made to:
- Keep the project lightweight and dependency-free
- Demonstrate core JavaScript skills and DOM manipulation
- Ensure fast loading times and optimal performance
- Make the codebase easily understandable and maintainable

**State Management**: The application uses a simple state object (`seesawState`) to manage all application data. This centralized approach makes it easy to:
- Track all weights and their properties
- Calculate physics in real-time
- Persist state to LocalStorage
- Reset the entire application state

**Physics Implementation**: The torque and angle calculations follow a simplified physics model:
- Torque is calculated as the sum of weight × distance for each side
- The angle formula `(rightTorque - leftTorque) / 10` provides a linear relationship that's easy to understand and visualize
- The angle is clamped between -30° and +30° for visual clarity and to prevent extreme rotations

### UI/UX Design Decisions

**Visual Feedback**: 
- Cursor indicator shows where weights will be placed before clicking
- Weight boxes scale dynamically based on their mass value
- Color palette differentiates weights visually (1kg = light blue, 10kg = purple)
- Smooth CSS transitions make the seesaw rotation feel natural

**Layout Structure**:
- Sidebar for weight logs keeps the main simulation area clean
- Information panels at the top provide immediate feedback
- Responsive design ensures usability on all devices

**Interaction Design**:
- Click-to-add is intuitive and requires no learning curve
- Hover-to-reveal delete buttons keeps the UI clean while providing functionality
- Reset button is easily accessible but not intrusive

## ⚖️ Trade-offs & Limitations

### Trade-offs Made

1. **Simplified Physics Model**: The angle calculation uses a linear formula rather than complex physics equations. This was a deliberate choice to:
   - Make the simulation more predictable and educational
   - Ensure smooth visual transitions
   - Keep calculations performant
   - **Trade-off**: Less physically accurate, but more visually intuitive

2. **No Framework**: Using vanilla JavaScript means:
   - **Pros**: No build process, fast loading, easy to understand
   - **Cons**: More manual DOM manipulation, no built-in state management patterns

3. **LocalStorage Only**: State persistence uses browser LocalStorage:
   - **Pros**: Simple, no backend needed, works offline
   - **Cons**: Data is device-specific, limited storage capacity (~5-10MB)

4. **Fixed Plank Width**: The seesaw has a fixed 400px width:
   - **Pros**: Consistent calculations, predictable behavior
   - **Cons**: Less flexible for different screen sizes (though responsive design handles this)

### Current Limitations

1. **Weight Overlap**: Multiple weights can be placed at the same position, which may not be visually clear
2. **No Undo/Redo**: Once a weight is deleted, there's no way to undo the action
3. **Limited Weight Range**: Weights are constrained to 1-10 kg range
4. **No Export/Import**: Weight configurations cannot be saved or shared
5. **Single Seesaw**: Only one seesaw can be simulated at a time
6. **No Animation Speed Control**: Physics calculations happen immediately without adjustable speed

### Potential Improvements

- Add weight collision detection to prevent overlapping
- Implement undo/redo functionality
- Allow custom weight values
- Add export/import functionality for configurations
- Implement multiple seesaw scenarios
- Add animation speed controls for educational purposes

## 🤖 AI Assistance

This project was developed with AI assistance in the following areas:

- **README Documentation**: The README file structure, formatting, and comprehensive documentation were created with AI assistance to ensure it follows GitHub best practices and includes all necessary sections.

- **Code Review & Optimization Suggestions**: AI was consulted for:
  - Analyzing and planning the project
  - Best practices in vanilla JavaScript DOM manipulation
  - CSS animation and transition optimization
  - State management patterns
  - Performance considerations

- **Documentation Writing**: AI helped structure and write clear, professional documentation that explains the project's features, usage, and technical details.

**Note**: All core functionality, physics calculations, UI design, and implementation decisions were made by the developer. AI assistance was primarily used for documentation, code review, and ensuring best practices.

## 👤 Author

Created by the project developer.

---

⭐ If you liked this project, don't forget to give it a star!
