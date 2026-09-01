import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Ausgaben from "./pages/ausgaben";
import { Provider } from "./components/provider";

function App() {
	return (
		<Provider>
			<Switch>
				<Route path="/" component={Index} />
				<Route path="/ausgaben" component={Ausgaben} />
			</Switch>
		</Provider>
	);
}

export default App;
