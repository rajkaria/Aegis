import { readContract as viemReadContract } from "./provider.js";
import { encodeFunctionData, type Abi } from "viem";

// ---------------------------------------------------------------------------
// Generic contract interaction helpers
// ---------------------------------------------------------------------------

export interface ContractReadParams {
  chain: string;
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}

export interface ContractWriteParams extends ContractReadParams {
  value?: bigint;
}

export interface EncodedContractWrite {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
}

/**
 * Call a read-only (view/pure) contract function and return the result.
 * Delegates to the provider's readContract wrapper.
 */
export async function contractRead(params: ContractReadParams): Promise<unknown> {
  const { chain, address, abi, functionName, args } = params;
  return viemReadContract(chain, {
    address,
    abi,
    functionName,
    args: args as never[],
  });
}

/**
 * Encode a state-mutating contract call without broadcasting it.
 * Returns { to, data, value } suitable for signing and sending.
 *
 * Use this to prepare a transaction for an agent's wallet to sign.
 */
export function encodeContractWrite(params: ContractWriteParams): EncodedContractWrite {
  const { address, abi, functionName, args, value } = params;

  const data = encodeFunctionData({
    abi,
    functionName,
    args: args as never[],
  });

  return {
    to: address,
    data,
    value: value ?? 0n,
  };
}
