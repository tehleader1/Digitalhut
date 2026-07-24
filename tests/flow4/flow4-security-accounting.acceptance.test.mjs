import {defineFlow4AcceptanceSuite} from "./flow4-security-accounting.contract.mjs"
import {createMockFlow4System} from "./fixtures/mock-flow4-system.mjs"

defineFlow4AcceptanceSuite({createSystem:createMockFlow4System})
