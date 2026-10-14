declare module 'ml-cart' {
  export class DecisionTreeClassifier {
    constructor(options?: any);
    train(X: number[][], y: number[]): void;
    predict(X: number[][]): number[];
    toJSON(): any;
    static load(model: any): DecisionTreeClassifier;
  }
  export class DecisionTreeRegression {
    constructor(options?: any);
    train(X: number[][], y: number[]): void;
    predict(X: number[][]): number[];
    toJSON(): any;
    static load(model: any): DecisionTreeRegression;
  }
}

declare module 'ml-random-forest' {
  export class RandomForestClassifier {
    constructor(options?: any);
    train(X: number[][], y: number[]): void;
    predict(X: number[][]): number[];
    toJSON(): any;
    estimators: any[];
    static load(model: any): RandomForestClassifier;
  }
}
