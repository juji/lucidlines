import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import JSON5 from "json5";

export interface LucidLinesConfig {
	port?: number;

	/** Commands to run */
	commands?: Array<{
		/** Display name for the command */
		name: string;
		/** Shell command to execute */
		command: string;
	}>;

	/** Development options */
	dev?: boolean;
}

/**
 * Default configuration for LucidLines
 */
const defaultConfig: LucidLinesConfig = {
	port: 8080,
	commands: [
		{
			name: "ECHO",
			command: "echo 'Hello, World!'",
		},
		{
			name: "YOU",
			command: "npm run dev",
		},
	],
	dev: false,
};

/**
 * Loads a JSON5 configuration file
 */
export function loadConfig(configPath?: string): LucidLinesConfig | null {
	const filePath = configPath || join(process.cwd(), ".lucidlines.json5");

	if (!existsSync(filePath)) {
		return null;
	}

	try {
		const configContent = readFileSync(filePath, "utf-8");
		return JSON5.parse(configContent);
	} catch (error) {
		console.error(
			`❌ Failed to parse configuration file ${filePath}: ${error}`,
		);
		process.exit(1);
	}
}

/**
 * Creates a .lucidlines.json5 configuration file in the current directory
 */
export function createConfig(): void {
	const configPath = join(process.cwd(), ".lucidlines.json5");

	// Check if config already exists
	if (existsSync(configPath)) {
		console.log(
			`ℹ️  Configuration file .lucidlines.json5 already exists in ${process.cwd()}`,
		);
		return;
	}

	// Convert config to JSON5 format with comments
	const configContent = `{
	// LucidLines configuration file
	// This file configures the LucidLines terminal streaming server
	// See https://github.com/juji/lucidlines for documentation

	// Port to run the server on
	port: ${defaultConfig.port},

	// Commands to run when the server starts
	commands: [
		${defaultConfig.commands
			?.map(
				(cmd) => `{
			// Display name for this command (shown in UI)
			name: "${cmd.name}",

			// Shell command to execute
			command: "${cmd.command.replace(/"/g, '\\"')}",
		}`,
			)
			.join(",\n\t\t")}
	],

	// Enable development mode
	// true: will output logs to console
	dev: ${defaultConfig.dev},
}`;

	writeFileSync(configPath, configContent, "utf-8");
	console.log("✅ Configuration file created successfully!");
	console.log("Edit .lucidlines.json5 to customize your LucidLines setup.");

	// Also update package.json scripts
	updatePackageJsonScripts();
}

/**
 * Updates package.json to add lucidlines script
 */
function updatePackageJsonScripts(): void {
	const packageJsonPath = join(process.cwd(), "package.json");

	if (!existsSync(packageJsonPath)) {
		console.log("ℹ️  No package.json found, skipping script addition");
		return;
	}

	try {
		const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(packageJsonContent);

		// Initialize scripts object if it doesn't exist
		if (!packageJson.scripts) {
			packageJson.scripts = {};
		}

		// Add lucidlines script if it doesn't exist
		if (!packageJson.scripts.lucidlines) {
			packageJson.scripts.lucidlines = "lucidlines";
			writeFileSync(
				packageJsonPath,
				JSON.stringify(packageJson, null, 2) + "\n",
				"utf-8",
			);
			console.log("✅ Added 'lucidlines' script to package.json");
		} else {
			console.log("ℹ️  'lucidlines' script already exists in package.json");
		}
	} catch (error) {
		console.log(`⚠️  Could not update package.json: ${error}`);
	}
}
