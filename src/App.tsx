// Components
import LeftPane from "./components/05_templates/LeftPane";
import RightPane from "./components/05_templates/RightPane";
// Styles
import "./App.css";

const App = () => {

  return (
    <main className="container">
      <LeftPane />
      <RightPane />
    </main>
  );
}

export default App;
