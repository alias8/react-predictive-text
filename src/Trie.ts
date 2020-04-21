import { createMachine, interpret, Machine } from "xstate";
import sizeof from "object-sizeof";

interface IObj {
  id: string;
  initial: string;
  states: {
    // @ts-ignore
    _end: {
      type: "final";
    };
    _start: {
      on: {
        [char: string]: string;
      };
    };
    [char: string]: {
      on: {
        [char: string]: string;
      };
    };
  };
}

const obj2: IObj = {
  id: "FSM",
  initial: "_start",
  states: {
    _end: {
      // @ts-ignore
      type: "final",
    },
    _start: {
      on: {},
    },
  },
};

fetch("/text2.txt")
  .then((r) => r.text())
  .then((text) => {
    const words = text
      .split("\n")
      .sort((a, b) => (a < b ? -1 : 1))
      .map((word, index) => ({
        word,
        rank: index,
      }));

    console.time("method 2");
    words.forEach((word) => {
      // find longest prefix already in object
      // let longestPrefix = "";
      // for (let i = word.word.length - 1; i > 0; i--) {
      //   const prefix = word.word.slice(0, i);
      //   if (obj2.states[prefix]) {
      //     longestPrefix = prefix;
      //     break;
      //   }
      // }
      word.word
        .split("")
        // .slice(longestPrefix.length)
        .forEach((letter, index, array) => {
          const end = array.length - 1 === index;
          if (!end) {
            // const wordSoFar =
            //   longestPrefix + array.slice(0, index + 1).join("");
            const wordSoFar = array.slice(0, index + 1).join("");
            const secondLast = array.length - 2 === index;
            const nextLetter = array[index + 1];
            if (wordSoFar.length === 1) {
              if (!obj2.states._start.on[wordSoFar]) {
                obj2.states._start.on[wordSoFar] = wordSoFar;
              }
            }
            if (!obj2.states[wordSoFar]) {
              obj2.states[wordSoFar] = {
                on: {
                  [nextLetter]: secondLast ? "_end" : wordSoFar + nextLetter,
                },
              };
            }
          }
        });
    });
    console.timeEnd("method 2");
    console.log(
      `obj size: ${sizeof(obj2) / 10 ** 6}MB, ${
        Object.keys(obj2.states).length - 2
      } length`
    );

    const machine = createMachine(obj2);
    const toggleService = interpret(machine)
      .onTransition((state) => {
        console.log(state.value);
      })
      .start();
    // todo: how to do predictive text with this? I don't think this will work, try this: http://pages.pathcom.com/~vadco/dawg.html
    toggleService.send("D");
    toggleService.send("O");
    const gg = 2;
  });

export interface Node1 {
  isCompleteWord: boolean;
  rank?: number;
  children: {
    [char: string]: Node1;
  };
}

export interface IWord {
  word: string;
  rank?: number;
}

export class Trie {
  public tree: Node1 = {
    isCompleteWord: false,
    children: {},
  };
  private wordCount = 0;
  constructor(words: IWord[]) {
    words.forEach((word) => {
      this.insert(word.word, word.rank);
      if (this.wordCount % 1000 === 0) {
        console.log("word count ", this.wordCount);
      }
    });
  }

  insert(word: string, rank: number | undefined, node: Node1 = this.tree) {
    if (word.length === 0) {
      this.wordCount++;
      return;
    }
    if (!node.children[word[0]]) {
      node.children[word[0]] = {
        isCompleteWord: word.length === 1,
        rank: word.length === 1 ? rank : undefined,
        children: {},
      };
    }
    this.insert(word.slice(1), rank, node.children[word[0]]);
  }

  has(word: string, node: Node1 = this.tree): boolean {
    if (word.length === 0 && node.isCompleteWord) {
      return true;
    }
    if (node.children[word[0]]) {
      return this.has(word.slice(1), node.children[word[0]]);
    }
    return false;
  }

  // Finds node, may not necessarily be a complete word
  findNode(word: string, node: Node1 = this.tree): Node1 | undefined {
    if (word.length === 0) {
      return node;
    }
    if (node.children[word[0]]) {
      return this.findNode(word.slice(1), node.children[word[0]]);
    }
    return undefined;
  }

  remove(
    word: string,
    originalWord: string = word,
    node: Node1 = this.tree
  ): boolean {
    if (word.length === 0 && node.isCompleteWord) {
      node.isCompleteWord = false;
      this.wordCount--;
      if (Object.keys(node.children).length === 0) {
        // delete further up chain
        // todo: is this needed?
        const parentNode = this.findNode(
          originalWord.slice(0, originalWord.length - 1)
        );
        if (parentNode) {
          parentNode.children = {};
        }
      }
      return true;
    }
    if (node.children[word[0]]) {
      return this.remove(word.slice(1), originalWord, node.children[word[0]]);
    }
    return false;
  }

  printAllWords(
    cb = (val: string) => {
      console.log(val);
    },
    node: Node1 = this.tree,
    w = ""
  ) {
    let word = w;
    if (node.isCompleteWord) {
      cb(word);
    }
    Object.entries(node.children).forEach(([char, node]) => {
      word += char;
      this.printAllWords(cb, node, word); // depth-first search
      word = word.substr(0, word.length - 1); // backward tracking, take off last letter
    });
  }

  wordsCount() {
    return this.wordCount;
  }
}
