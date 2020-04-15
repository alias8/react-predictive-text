import React from "react";
import { Trie } from "./Trie";

interface IProps {
  text: string;
  sendSuggestions: (suggestions: string[]) => void;
}

interface IState {
  words: IWord[];
  trie: Trie;
}

export interface IWord {
  word: string;
  freq: number;
}

// todo: use the frequency to make suggestions for word completion?
export class TrieWrapper extends React.Component<IProps, IState> {
  componentDidMount() {
    fetch("/text.txt")
      .then((r) => r.text())
      .then((text) => {
        const words = text.split("\n").map((item) => ({
          word: item.split(" ")[0],
          freq: Number.parseInt(item.split(" ")[1]),
        }));
        const trie = new Trie(words);
        this.setState({
          words,
          trie,
        });
      });

    const bb = 2;
  }

  componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<IState>,
    snapshot?: any
  ): void {
    if (prevProps.text !== this.props.text) {
      this.props.sendSuggestions(["soemthing1", "soemthing2"]);
      // todo: find way to predict new words / next letter
    }
  }

  render() {
    return <div />;
  }
}
