type BaseQuestion = {
    question: string;
};
type QcmQuestion = BaseQuestion & {
    type: "qcm";
    options: string[];
    answer: number[];
};
type VfQuestion = BaseQuestion & {
    type: "vf";
    answer: boolean;
};
export type Question = QcmQuestion | VfQuestion;
export {};
//# sourceMappingURL=main.d.ts.map