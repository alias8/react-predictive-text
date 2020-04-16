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
