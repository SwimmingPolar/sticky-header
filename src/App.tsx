import "./App.css";
import Card from "./components/Card";

const Container = () => {
  return (
    <div className="container">
      {Array.from({ length: 30 }).map((_, index) => (
        <Card key={index} />
      ))}
    </div>
  );
};

function App() {
  return <Container />;
}

export default App;
