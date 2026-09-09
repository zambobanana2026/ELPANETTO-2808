import { Route, Switch } from "wouter";
import Index from "./pages/index";
import OpManager from "./pages/op-manager";
import { Provider } from "./components/provider";

function App() {
	return (
		<Provider>
			<Switch>
				<Route path="/" component={Index} />
				<Route path="/op-manager" component={OpManager} />
			</Switch>
		</Provider>
	);
}

export default App;
