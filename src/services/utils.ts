export const getColumnNames = async (file: File, nChars = 10_000): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            // Split the content by lines and extract the header (first line)
            const lines = content.split('\n');
            if (lines.length > 0) {
                const header = lines[0];
                const columnNames = header.split(",");
                resolve(columnNames);
            } else {
                reject(new Error("Invalid CSV file"))
            }
        }
        const blob = file.slice(0, nChars);
        reader.readAsText(blob)
    })
}