"use client";

import React from "react";

type Step = "userDetails" | "healthConditions" | "medications";

type Props = {
	isConnected: boolean;
	step?: Step;
};

const initState: Props = {
	isConnected: false,
	step: "userDetails",
};

const AppStateCtx = React.createContext<Props>(initState);
const SetAppStateCtx = React.createContext<
	React.Dispatch<React.SetStateAction<Props>>
>(() => null);

const AppStateProvider: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = React.useState<Props>(initState);

	return (
		<SetAppStateCtx.Provider value={dispatch}>
			<AppStateCtx.Provider value={state}>{children}</AppStateCtx.Provider>
		</SetAppStateCtx.Provider>
	);
};

export const useAppState = () => React.useContext(AppStateCtx);
export const useSetAppState = () => React.useContext(SetAppStateCtx);

export default AppStateProvider;
