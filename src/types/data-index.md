# MJFood Data Index & Search Guide

This index provides a quick reference for restaurant IDs to avoid reading the massive `src/data2.ts` file.

## Quick Lookup (Samples)
| ID | Name | Category | Line (approx) |
|---|---|---|---|
| K1 | 부안식당 | 한식 | 8 |
| K2 | 대한카츠 | 일식 | 147 |
| K9 | 한술식당 | 한식 | 177 |
| K24 | 삼정식당 | 한식 | 316 |
| K42 | 대가감자탕 | 한식 | 359 |
| K3 | 치즈밥있슈 | 한식 | 462 |

## Efficient Searching Rules
To find a specific restaurant without consuming tokens for the whole file:

1. **Find Entry Point**:
   ```bash
   grep -n "id: \"K12\"" src/data2.ts
   ```

2. **Read Specific Block**:
   Once you have the line number (e.g., 1303), read the next 30 lines:
   `view_file(AbsolutePath="...", StartLine=1303, EndLine=1333)`

3. **Search by Name**:
   ```bash
   grep -i "부안식당" src/data2.ts
   ```

## Categorization
- **K**: 한식/일식 등 (Korean/Japanese/etc)
- **C**: 카페 (Cafe)
- **W**: 양식 (Western)
- **S**: 분식/간편식 (Snacks)
*(Note: IDs follow the prefix in the `id` field)*
