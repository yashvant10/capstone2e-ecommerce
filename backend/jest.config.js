/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "src/routes/**/*.ts",
    "src/middlewares/**/*.ts",
    "src/utils/**/*.ts"
  ],
  coverageDirectory: "coverage"
};