import React, { ChangeEvent } from "react";
import "./App.css";
import { TrieWrapper } from "./TrieWrapper";
import { IWord } from "./Trie";

interface IState {
  text: string;
  suggestions: IWord[];
}

class App extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      text: "",
      suggestions: [
        {
          word: "",
        },
      ],
    };
  }

  handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      text: event.target.value,
    });
  };

  handleSuggestions = (suggestions: IWord[]) => {
    this.setState({
      suggestions,
    });
  };

  render() {
    const { text, suggestions } = this.state;
    return (
      <div className="App">
        <TrieWrapper text={text} sendSuggestions={this.handleSuggestions} />
        <textarea
          className={"textbox suggestions"}
          value={suggestions
            .map((suggestion) => `${suggestion.word} ${suggestion.rank}`)
            .join("\n")}
          readOnly={true}
          style={{ color: "green" }}
        />
        <textarea
          className={"textbox"}
          onChange={this.handleTextChange}
          value={text}
        />
      </div>
    );
  }
}

export default App;
