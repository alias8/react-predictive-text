import React from "react";
import { IWord, Node1, Trie } from "./Trie";
import { last } from "lodash";
import sizeof from "object-sizeof";

interface IProps {
  text: string;
  sendSuggestions: (suggestions: IWord[]) => void;
}

interface IState {
  words: IWord[];
  trie: Trie; // todo: work out size in MB of this object, how does it compare to DAFSA?
}

// todo: read how to make Deterministic acyclic finite state automaton which is faster than a trie https://www.aclweb.org/anthology/J00-1002.pdf
// trie seems to perform ok when when searching 1,2,3, and 4 letters ahead
export class TrieWrapper extends React.Component<IProps, IState> {
  componentDidMount() {
    console.time("build");
    fetch("/text.txt")
      .then((r) => r.text())
      .then((text) => {
        const words = text.split("\n").map((word, index) => ({
          word,
          rank: index,
        }));
        const trie = new Trie(words);
        console.timeEnd("build");
        this.setState({
          words,
          trie,
        });
        console.log(`trie size: ${sizeof(trie.tree) / 10 ** 6}MB`);
      });
  }

  componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<IState>,
    snapshot?: any
  ): void {
    const lastWord = last(this.props.text.split(" "));
    const prevLastWord = last(prevProps.text.split(" "));
    if (lastWord !== prevLastWord) {
      console.time("find");
      const suggestions = this.findSuggestions(lastWord);
      console.timeEnd("find");
      this.props.sendSuggestions(suggestions);
      // todo: find way to predict new words / next letter
    }
  }

  findSuggestions = (lastWord: string | undefined): IWord[] => {
    // for "do" do we show "dog", "dot" or "does"? evaluate completed words 1 or 2 steps away from the current node

    // for "wheneve", the predicted word is "whenever" but we could have predicted that if we search 4 nodes ahead when on "when"
    if (lastWord) {
      const node = this.state.trie.findNode(lastWord);
      if (node) {
        const oneLetterMore = this.getWordsOneLetterMore(node, lastWord);
        const twoLettersMore = this.getWordsTwoLettersAhead(node, lastWord);
        const threeLettersMore = this.getWordsThreeLettersAhead(node, lastWord);
        const fourLettersMore = this.getWordsFourLettersAhead(node, lastWord);

        return [
          ...oneLetterMore,
          ...twoLettersMore,
          ...threeLettersMore,
          ...fourLettersMore,
        ].sort((a, b) => a.rank! - b.rank!);
      } else {
        return [{ word: "no node", rank: undefined }];
      }
    } else {
      return [{ word: "no last word", rank: undefined }];
    }
  };

  getWordsFourLettersAhead = (node: Node1, lastWord: string) =>
    Object.entries(node.children)
      .map(([key, node], index, array) =>
        this.getWordsThreeLettersAhead(node, lastWord + key)
      )
      .reduce((prev, current) => [...prev, ...current], []);

  getWordsThreeLettersAhead = (node: Node1, lastWord: string) =>
    Object.entries(node.children)
      .map(([key, node], index, array) =>
        this.getWordsTwoLettersAhead(node, lastWord + key)
      )
      .reduce((prev, current) => [...prev, ...current], []);

  getWordsTwoLettersAhead = (node: Node1, lastWord: string) =>
    Object.entries(node.children)
      .map(([key, node], index, array) =>
        this.getWordsOneLetterMore(node, lastWord + key)
      )
      .reduce((prev, current) => [...prev, ...current], []);

  getWordsOneLetterMore = (node: Node1, prefix: string): IWord[] => {
    const children = Object.entries(node.children).length;
    const completeChildren = Object.entries(node.children).filter(
      ([key, value]) => value.isCompleteWord
    ).length;
    console.log(
      `prefix: ${prefix} searching ${children} children, ${completeChildren} are complete`
    );
    return Object.entries(node.children)
      .filter(([key, value]) => value.isCompleteWord)
      .sort((a, b) => a[1].rank! - b[1].rank!)
      .map(([nextLetter, value]) => ({
        word: prefix + nextLetter,
        rank: value.rank,
      }));
  };

  render() {
    return <div />;
  }
}
