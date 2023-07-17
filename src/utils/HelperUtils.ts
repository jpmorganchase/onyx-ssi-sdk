import axios from 'axios'
import * as fs from 'fs'
import { AxiosRequestFailureError, JsonParseError, ReadFileJsonFailureError } from '../errors'

export class HelperUtils {

    /**
     * Safe version of axios GET call
     * 
     * @param payload payload of axios GET request
     * @returns response of axios GET
     * Throws `AxiosRequestFailureError` if request goes wrong
     */
    static async axiosHelper(payload: string) {
        try {
            const response = await axios.get(payload)
            return response.data
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw new AxiosRequestFailureError(error.message)
        }
    }

    /**
     * Safe version of reading JSON from a local file location
     * 
     * @param location local file location
     * @returns JSON object from parsed file
     * Throws `ReadFileJsonFailureError` if reading or parsing fails
     */
    static async fileReaderJSON(location: string) {
        try {
            const fileText = fs.readFileSync(location, 'utf-8');
            return HelperUtils.parseJSON(fileText)
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw new ReadFileJsonFailureError(error.message)
        } 
    }

    /**
     * Safe version of parsing string to JSON object
     * 
     * @param payload JSON string to parse into object
     * @returns JSON object from string
     * Throws `JsonParseError` if parsing fails
     */
    static parseJSON(payload: string) {
        try {
            return JSON.parse(payload);
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw new JsonParseError(error.message)
        } 
    }
}