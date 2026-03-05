# Upload and Classify Document

Upload a document to Document repository and apply appropriate tags, correspondents, and document types.

## Steps

1. **Prepare the document**
   - Ensure file is accessible (PDF, images, etc.)
   - Review document content to determine classification

2. **Identify metadata**
   - Determine primary folder tag (F prefix)
   - Identify related-to tags (people, organizations)
   - Set document type (Invoice, Receipt, Correspondence, etc.)
   - Check if correspondent is needed
   - Apply lifecycle tag (Inbox, Action, Record, etc.)
   - Set retention policy if applicable (R prefix)

3. **Upload document**
   ```bash
   # Using MCP tool
   paperless_post_document \
     --file="/path/to/document.pdf" \
     --filename="document.pdf" \
     --title="Descriptive Title" \
     --correspondent=<id> \
     --document_type=<id> \
     --tags=[<tag_ids>]
   ```

4. **Verify upload**
   - Check document appears in list
   - Confirm OCR processing completed
   - Verify tags applied correctly

## Example: Upload Insurance Document

**Scenario:** Upload AAMI car insurance renewal

```bash
# 1. Check for existing correspondent
paperless_list_correspondents | grep -i aami

# 2. Upload with metadata
paperless_post_document \
  --file="/path/to/AAMI_renewal.pdf" \
  --filename="AAMI_Renewal_2025.pdf" \
  --title="AAMI Car Insurance Renewal 2025" \
  --correspondent=3 \
  --document_type=4 \
  --tags=[16,44,1]
```

**Tags explanation:**
- Tag 16: F Amateur radio license (folder tag)
- Tag 44: Ammi and Thaththi (related-to)
- Tag 1: Record (lifecycle)

## Example: Upload Receipt

**Scenario:** Upload JB Hi-Fi receipt for new monitor

```bash
paperless_post_document \
  --file="/path/to/jb_receipt.pdf" \
  --filename="JB_HiFi_Monitor_2025.pdf" \
  --title="JB Hi-Fi Monitor Purchase Receipt" \
  --correspondent=18 \
  --document_type=1 \
  --tags=[42,34,19,2]
```

**Tags explanation:**
- Tag 42: F Shares portfolio (folder)
- Tag 34: Cytrax (related-to)
- Tag 19: Action (lifecycle - for reimbursement)
- Tag 2: Family (related-to)

## Best Practices

1. **Descriptive titles:** Use clear, searchable titles with dates
2. **Consistent tagging:** Follow the color-coded tag system
3. **Folder first:** Always assign a folder tag for primary categorization
4. **Lifecycle management:** Set initial lifecycle (Inbox → Action → Record)
5. **Retention:** Apply R prefix tags for time-sensitive documents

## Automation Considerations

- Auto-tag by correspondent matching (configured in Paperless)
- Auto-tag by document type detection
- Set up consumption folders for bulk uploads
- Use matching algorithms for automatic classification
