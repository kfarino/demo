"use client";

import React from "react";

import { useConversation } from "@11labs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Header from "./Header";
import {
	ConversationData,
	useConversationData,
	useSetConversationData,
} from "@/context/ConversationData";
import Ai from "@/ai";

export default function Home() {
	const conversation = useConversation();
	const [isCollecting, setIsCollecting] = useState(false);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [hasAudioAccess, setHasAudioAccess] = useState(false);
	const [showCreateAccount, setShowCreateAccount] = useState(false);
	const [showHealthConditions, setShowHealthConditions] = useState(false);
	const [isConnectButtonFading, setIsConnectButtonFading] = useState(false);
	const streamRef = useRef<MediaStream | null>(null);
	const [userData, setUserData] = useState<ConversationData>();

	const conversationData = useConversationData();
	const setConversationData = useSetConversationData();

	const moveToHealthConditions = useCallback(() => {
		console.log("Moving to health conditions screen");
		setShowCreateAccount(false);
		setShowHealthConditions(true);
	}, [setShowCreateAccount, setShowHealthConditions]);

	const moveBackToAccount = useCallback(() => {
		console.log("Moving back to account screen");
		setShowHealthConditions(false);
		setShowCreateAccount(true);
	}, [setShowCreateAccount, setShowHealthConditions]);

	console.log(conversation.status, conversation.isSpeaking);

	// Monitor connection status
	useEffect(() => {
		console.log("Connection status changed:", {
			status: conversation.status,
			showCreateAccount,
			showHealthConditions,
		});
		// Show create account screen only after connecting
		if (conversation.status === "connected") {
			if (!showCreateAccount && !showHealthConditions) {
				console.log("Setting showCreateAccount to true from useEffect");
				setShowCreateAccount(true);
			}
		} else {
			// Reset states when disconnected
			setShowCreateAccount(false);
			setShowHealthConditions(false);
		}
	}, [conversation.status, showCreateAccount, showHealthConditions]);

	// Audio stream handling
	const requestAudioPermissions = async () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false,
				},
			});
			streamRef.current = stream;
			setHasAudioAccess(true);
			return stream;
		} catch (err) {
			console.error(err);
			toast.error(
				"Please grant audio permissions in site settings to continue"
			);
			setHasAudioAccess(false);
			return null;
		}
	};

	// Cleanup audio stream on unmount
	useEffect(() => {
		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => {
					track.stop();
				});
				streamRef.current = null;
			}
		};
	}, []);

	const endCall = async () => {
		if (!conversationId) {
			toast.error("Conversation not found");
			return;
		}

		try {
			await conversation?.endSession();
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
				streamRef.current = null;
			}
			// Reset all states to initial values
			setIsCollecting(false);
			setConversationId(null);
			setShowCreateAccount(false);
			setShowHealthConditions(false);
			setUserData({});
		} catch (error) {
			console.error("Error ending call:", error);
			toast.error("Failed to end conversation");
		}
	};

	const startCall = async () => {
		setIsConnectButtonFading(true);

		try {
			if (!hasAudioAccess) {
				const stream = await requestAudioPermissions();
				if (!stream) {
					setIsConnectButtonFading(false);
					return;
				}
			}

			const handleUserDetails = async (
				parameters: ConversationData["userDetails"]
			) => {
				console.log("UserAccountInfo called with parameters:", parameters);

				setUserData((prev) => {
					const newData = {
						...prev,
						userDetails: {
							...(parameters?.first_name && {
								first_name: parameters.first_name.trim(),
							}),
							...(parameters?.last_name && {
								last_name: parameters.last_name.trim(),
							}),
							...(parameters?.role && { role: parameters.role }),
							// ...(parameters?.date_of_birth && {
							// 	date_of_birth: parameters.date_of_birth,
							// }),
							...(parameters?.phone_number && {
								phone_number: parameters.phone_number.replace(/\D/g, ""),
							}),

							isConfirmed: parameters?.step_completed,
						},
					};

					// If all required fields are filled and isConfirmed is true, move to health conditions
					if (parameters?.step_completed) {
						console.log(
							"Account details confirmed, moving to health conditions"
						);
						moveToHealthConditions();
					}

					console.log("Updated userData:", newData);
					return newData;
				});
			};

			const sessionConfig = {
				agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
				clientTools: {
					UserAccountInfo: handleUserDetails,
				},
				onConnect: ({ conversationId }: { conversationId: string }) => {
					console.log("Connected to agent:", conversationId);
					setConversationId(conversationId);
					setIsCollecting(true);
					setShowCreateAccount(true);
				},
				onError: (error: any) => {
					console.error("Connection error:", error);
					toast.error("Connection error occurred");
					setIsConnectButtonFading(false);
					setIsCollecting(false);
					setConversationId(null);
				},
				onDisconnect: () => {
					console.log("Disconnected from agent");
					setIsCollecting(false);
					setConversationId(null);
					setShowCreateAccount(false);
					setShowHealthConditions(false);
				},
			} as const;

			const conversationId = await conversation?.startSession(
				sessionConfig as any
			);
		} catch (error) {
			console.error("Error starting call:", error);
			toast.error("Failed to start conversation");
			setIsCollecting(false);
			setConversationId(null);
			setIsConnectButtonFading(false);
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
				streamRef.current = null;
			}
		}
	};

	return (
		<main className="min-h-screen bg-black text-white">
			<div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
				<div className="w-[1024px] h-[600px] border-2 border-white/30 overflow-hidden relative">
					<div className="w-full h-full flex flex-col overflow-hidden">
						<Header title="Welcome" />
						<Ai />
					</div>
				</div>
			</div>
		</main>
	);
}
