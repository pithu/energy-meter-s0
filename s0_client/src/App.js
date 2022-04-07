import './App.css';
import S0Chart from "./s0_chart/S0Chart";

function App() {
  return (
    <div className="S0App">
      <S0Chart
          s0_server_url="http://raspberrypi1:8080"
          minutes_aggregate={5}
      />
    </div>
  );
}

export default App;
