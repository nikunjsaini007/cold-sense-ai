import ApiApp from './ApiApp.jsx';
import AiAssistant from './components/AiAssistant.jsx';
import AuthGate from './components/AuthGate.jsx';
import LocationCard from './components/LocationCard.jsx';
import ProfileMenu from './components/ProfileMenu.jsx';
import LocationExperience from './components/LocationExperience.jsx';

export default function App() {
  return <AuthGate><ApiApp /><LocationCard /><AiAssistant /><ProfileMenu /><LocationExperience /></AuthGate>;
}
