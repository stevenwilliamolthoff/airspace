import axios from "axios"
import { Operation } from "./interfaces/operations"

export default class Api {
  static async getOperations() {
    const response = await axios({
      url: "http://localhost:8080/operations",
    })
    const operationResponse: { operations: Operation[] } = response.data
    return operationResponse
  }
  static async getOperation(id: number) {
    const response = await axios({
      url: `http://localhost:8080/operations/${id}`,
    })
    const operationResponse: { operation: Operation } = response.data
    return operationResponse
  }
  static async putOperation(operation: Partial<Operation>) {
    const response = await axios({
      url: "http://localhost:8080/operations",
      method: "put",
      data: operation,
    })
    const operationResponse: { operation: Operation } = response.data
    return operationResponse
  }
  static async postOperation(operation: Operation) {
    const response = await axios({
      url: `http://localhost:8080/operations/${operation.id}`,
      method: "post",
      data: operation,
    })
    const operationResponse: { operation: Operation } = response.data
    return operationResponse
  }
}
