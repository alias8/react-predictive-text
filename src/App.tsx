import React, { ChangeEvent } from "react";
import "./App.css";
import { TrieWrapper } from "./TrieWrapper";

interface IState {
  text: string;
  suggestions: string[];
}

class App extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      text: "",
      suggestions: [],
    };
  }

  handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      text: event.target.value,
    });
  };

  handleSuggestions = (suggestions: string[]) => {
    this.setState({
      suggestions,
    });
  };

  // event: ChangeEvent<HTMLTextAreaElement>
  render() {
    const { text, suggestions } = this.state;
    return (
      <div className="App">
        <TrieWrapper text={text} sendSuggestions={this.handleSuggestions} />
        <textarea
          value={suggestions}
          readOnly={true}
          style={{ color: "green" }}
        />
        <textarea onChange={this.handleTextChange} value={text} />
      </div>
    );
  }
}

export default App;
