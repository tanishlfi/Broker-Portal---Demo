export type Result<T, E = Error, M = string> = 
    | {success: true, message: M, data: T } 
    | {success: false, message: M, err: E }


export type FunctionResult<T, E = Error, M = string> = 
    | {success: true, message: M, data: T[] } 
    | {success: false, message: M, err: E }


export type RuleResult<T, E = Error, M = string> = 
    | {success: true, message: M, data: T[] } 
    | {success: false, message: M, err: E[] }