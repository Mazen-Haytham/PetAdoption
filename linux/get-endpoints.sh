#!/usr/bin/env bash
# get-endpoints.sh
# Run from your .NET project root:
#   ./get-endpoints.sh
# Or target a specific folder:
#   ./get-endpoints.sh ./src/MyApi/Controllers
# Output is printed to console and saved to endpoints.md

CONTROLLERS_PATH="${1:-.}"
OUTPUT_FILE="${2:-endpoints.md}"

mapfile -d '' CONTROLLER_FILES < <(find "$CONTROLLERS_PATH" -name "*Controller.cs" -print0)

if [ ${#CONTROLLER_FILES[@]} -eq 0 ]; then
    echo "No controller files found under: $CONTROLLERS_PATH" >&2
    exit 1
fi

output="# API Endpoints\n\n"

for file in "${CONTROLLER_FILES[@]}"; do
    content=$(<"$file")
    filename=$(basename "$file" .cs)
    controller_name="${filename%Controller}"

    # Controller-level route
    controller_route=""
    if [[ $content =~ \[Route\(\"([^\"]+)\"\)\] ]]; then
        controller_route="${BASH_REMATCH[1]}"
    fi
    # Replace [controller] token
    controller_route="${controller_route//\[controller\]/${controller_name,,}}"

    output+="## ${controller_name} Controller\n"
    output+="**Base Route:** \`${controller_route}\`\n\n"

    # Read lines into array
    mapfile -t lines <<< "$content"
    total=${#lines[@]}

    i=0
    while [ $i -lt $total ]; do
        line="${lines[$i]}"
        trimmed="${line#"${line%%[![:space:]]*}"}"

        # Match HTTP verb attributes
        if [[ $trimmed =~ ^\[(Http(Get|Post|Put|Patch|Delete|Head|Options))([^]]*)\] ]]; then
            verb="${BASH_REMATCH[2]}"
            verb="${verb^^}"
            route_part=""

            # Optional route on the attribute e.g. [HttpGet("{id}")]
            if [[ $trimmed =~ \(\"([^\"]+)\"\) ]]; then
                route_part="/${BASH_REMATCH[1]}"
            fi

            full_route="/${controller_route#/}${route_part}"

            # Collect attributes above this line
            attributes=()
            j=$((i - 1))
            while [ $j -ge 0 ]; do
                prev="${lines[$j]}"
                prev_trimmed="${prev#"${prev%%[![:space:]]*}"}"
                if [[ $prev_trimmed =~ ^\[ ]]; then
                    attributes=("$prev_trimmed" "${attributes[@]}")
                    j=$((j - 1))
                else
                    break
                fi
            done

            # Scan forward for method signature
            method_sig=""
            k=$((i + 1))
            while [ $k -lt $total ]; do
                next="${lines[$k]}"
                next_trimmed="${next#"${next%%[![:space:]]*}"}"
                if [[ $next_trimmed =~ ^\[ ]]; then
                    k=$((k + 1))
                    continue
                fi
                if [[ $next_trimmed =~ (public|private|protected) ]]; then
                    method_sig="$next_trimmed"
                    break
                fi
                k=$((k + 1))
            done

            # Extract return type
            return_type="unknown"
            re_task='Task<([^>]+)>'
            if [[ $method_sig =~ $re_task ]]; then
                return_type="${BASH_REMATCH[1]}"
            elif [[ $method_sig =~ (public|private|protected)[[:space:]]+([^[:space:]]+)[[:space:]]+[^[:space:]]+[[:space:]]*\( ]]; then
                return_type="${BASH_REMATCH[2]}"
            fi

            # Extract method name
            method_name="unknown"
            if [[ $method_sig =~ [[:space:]]([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*\( ]]; then
                method_name="${BASH_REMATCH[1]}"
            fi

            # Extract parameters
            route_params=()
            query_params=()
            other_params=()
            body_param=""

            re_params='\(([^)]*)\)'
            if [[ $method_sig =~ $re_params ]]; then
                param_block="${BASH_REMATCH[1]}"
                IFS=',' read -ra param_list <<< "$param_block"

                for param in "${param_list[@]}"; do
                    param="${param#"${param%%[![:space:]]*}"}"
                    param="${param%"${param##*[![:space:]]}"}"
                    [ -z "$param" ] && continue

                    if [[ $param =~ \[FromRoute\] ]]; then
                        p="${param//\[FromRoute\] /}"
                        p="${p//\[FromRoute\]/}"
                        route_params+=("${p## }")
                    elif [[ $param =~ \[FromQuery\] ]]; then
                        p="${param//\[FromQuery\] /}"
                        p="${p//\[FromQuery\]/}"
                        query_params+=("${p## }")
                    elif [[ $param =~ \[FromBody\] ]]; then
                        p="${param//\[FromBody\] /}"
                        p="${p//\[FromBody\]/}"
                        body_param="${p## }"
                    else
                        # Infer from route template
                        if [[ $full_route == *"{"* && $param =~ [[:space:]]([A-Za-z_][A-Za-z0-9_]*)$ ]]; then
                            pname="${BASH_REMATCH[1]}"
                            if [[ $full_route == *"{$pname}"* ]]; then
                                route_params+=("$param")
                            else
                                query_params+=("$param")
                            fi
                        else
                            other_params+=("$param")
                        fi
                    fi
                done
            fi

            # Format output block
            output+="### \`${verb} ${full_route}\`\n"
            output+="**Action:** ${method_name}\n"

            if [ ${#attributes[@]} -gt 0 ]; then
                attrs_joined=$(IFS=', '; echo "${attributes[*]}")
                output+="**Attributes:** ${attrs_joined}\n"
            fi

            if [ ${#route_params[@]} -gt 0 ]; then
                output+="**Route Params:**\n"
                for p in "${route_params[@]}"; do
                    output+="  - \`${p}\`\n"
                done
            fi

            if [ ${#query_params[@]} -gt 0 ]; then
                output+="**Query Params:**\n"
                for p in "${query_params[@]}"; do
                    output+="  - \`${p}\`\n"
                done
            fi

            if [ ${#other_params[@]} -gt 0 ]; then
                output+="**Other Params:**\n"
                for p in "${other_params[@]}"; do
                    output+="  - \`${p}\`\n"
                done
            fi

            if [ -n "$body_param" ]; then
                output+="**Request Body:** \`${body_param}\`\n"
            fi

            output+="**Response:** \`${return_type}\`\n\n"
        fi

        i=$((i + 1))
    done
done

printf "%b" "$output"
printf "%b" "$output" > "$OUTPUT_FILE"
echo "---"
echo "Saved to: $OUTPUT_FILE"