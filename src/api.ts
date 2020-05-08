import axios from "axios"
import { Operation } from "./interfaces/operations"

export default class Api {
  static async putOperation(operation: Operation) {
    const response = await axios({
      url: "http://localhost:8080/operations", // TODO: use env
      method: "put",
      data: operation,
    })
    const operationResponse: { operation: Operation } = response.data
    return operationResponse
  }
}
