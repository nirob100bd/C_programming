/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__tests__/helpers/style-mock.ts"
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/app/api/**/route.ts",
    "!src/lib/prisma.ts"
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { "tsconfig": { "jsx": "react-jsx", "module": "commonjs", "moduleResolution": "node" } }]
  }
};
