import { ThemeProvider } from './context/ThemeContext.jsx';
import AppContent from './AppContent';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
