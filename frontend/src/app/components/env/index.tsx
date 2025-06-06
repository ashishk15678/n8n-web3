"use client";

import {
  decryptEnvValue,
  encryptEnvValue,
  getEnv,
  useUpdateEnv,
} from "@/server-store";
import { useEnv } from "@/store";
import { Loader, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function EnvModal() {
  const { isEnvModalOpen, setIsEnvModalOpen } = useEnv();
  const [envName, setEnvName] = useState("");
  const [envValue, setEnvValue] = useState("");
  const randomId = useMemo(() => crypto.randomUUID(), []);
  const [showExistingEnv, setShowExistingEnv] = useState(false);
  const updateEnvMutation = useUpdateEnv();
  const {
    data: envs,
    isLoading: isLoadingEnvs,
    refetch: refetchEnvs,
  } = getEnv();

  const handleSave = async () => {
    if (!envName || !envValue) {
      toast.error("Please enter a valid env name and value");
      return;
    }

    try {
      await updateEnvMutation.mutateAsync({
        envId: randomId,
        envName,
        envValue,
      });
      toast.success("Env saved successfully");
      setIsEnvModalOpen(false);
      // Clear the form
      setEnvName("");
      setEnvValue("");
    } catch (error) {
      console.error(error);
      toast.error("Error saving env");
    }
  };

  return (
    <>
      {isEnvModalOpen && (
        <div
          className="fixed inset-0  bg-zinc-100/30 backdrop-blur-sm ring ring-zinc-300 ring-2 flex flex-col
        justify-center items-center"
        >
          <div className="flex flex-col gap-6 bg-gradient-to-br from-white to-zinc-100/50 shadow-xl py-4 px-6 rounded-xl ring ring-zinc-300 ring-2">
            {!showExistingEnv ? (
              <div className="flex flex-col gap-2">
                <div className="rounded-lg flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Env</h1>
                  <X
                    className="cursor-pointer rounded-full bg-zinc-100 p-1  top-8 right-2"
                    size={20}
                    onClick={() => setIsEnvModalOpen(false)}
                  />
                </div>

                <div className=" gap-2 p-2 rounded-lg">
                  <h1 className="text-xsm text-zinc-400">
                    Randomly generated env id
                  </h1>
                  <Input
                    value={randomId}
                    onChange={(e) => setEnvName(e.target.value)}
                    disabled={true}
                  />
                </div>

                <div className="ring ring-2 ring-zinc-100 p-4 rounded-lg">
                  <h1 className="text-xsm text-zinc-400">Env Name</h1>
                  <Input
                    placeholder="Enter Env Name"
                    value={envName}
                    onChange={(e) => setEnvName(e.target.value)}
                  />
                </div>
                <div className="ring ring-2 ring-zinc-100 p-4 rounded-lg">
                  <h1 className="text-xsm text-zinc-400">Env Value</h1>
                  <Input
                    placeholder="Enter Env Value"
                    value={envValue}
                    onChange={(e) => setEnvValue(e.target.value)}
                  />
                </div>

                <div className="flex justify-between w-full">
                  <button
                    className="bg-zinc-100 text-zinc-500 ring ring-zinc-200 shadow-md px-4 rounded-md transition-all duration-300 cursor-pointer
                 disabled:opacity-80 disabled:cursor-not-allowed"
                    onClick={() => setShowExistingEnv(true)}
                  >
                    Show existing Envs
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 rounded-md transition-all duration-300 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
                    disabled={
                      updateEnvMutation.isPending || !envName || !envValue
                    }
                    onClick={handleSave}
                  >
                    {updateEnvMutation.isPending ? (
                      <div className="flex items-center gap-2  py-0.5 px-2  text-white">
                        <Loader className="animate-spin" size={20} />
                      </div>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-bold">
                    Existing Environment Variables
                  </h1>
                  <button
                    onClick={() => refetchEnvs()}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    disabled={isLoadingEnvs}
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${
                        isLoadingEnvs ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                {isLoadingEnvs ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader className="animate-spin text-blue-500" size={24} />
                  </div>
                ) : envs ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="p-2 text-left border-b">Name</th>
                          <th className="p-2 text-left border-b">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(envs).map(([key, value]) => (
                          <tr key={key} className="hover:bg-zinc-50">
                            <td className="p-2 border-b font-mono text-sm">
                              {/* @ts-ignore */}
                              {value.name}
                            </td>
                            <td className="p-2 border-b font-mono text-sm">
                              {typeof value === "string"
                                ? "••••••••"
                                : // @ts-ignore
                                  decryptEnvValue(value.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4 text-zinc-500">
                    No environment variables found
                  </div>
                )}

                <button
                  className="bg-zinc-100 text-zinc-600 ring ring-zinc-200 px-4 rounded-md transition-all duration-300 cursor-pointer
                 disabled:opacity-80 disabled:cursor-not-allowed mt-4"
                  onClick={() => setShowExistingEnv(false)}
                >
                  Hide existing Envs
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Input({
  placeholder,
  value,
  onChange,
  ...props
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <input
      placeholder={placeholder}
      {...props}
      value={value}
      onChange={onChange}
      className="ring ring-2 ring-zinc-100 w-full px-2 py-1 rounded-md bg-white"
    />
  );
}

export function EnvModalButton() {
  const { setIsEnvModalOpen } = useEnv();
  return (
    <button
      className="bg-blue-500 text-white px-4 rounded-md absolute top-4 cursor-pointer shadow-md left-24"
      onClick={() => setIsEnvModalOpen(true)}
    >
      Env
    </button>
  );
}
