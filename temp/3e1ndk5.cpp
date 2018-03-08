#include <stdio.h>
#include <string.h>

int main()
{
	char InputStr[100][102] = { "\0", };

	int i = 0;
	int j = 0;
	char temp;

	while (i < 100) {
		scanf("%[^\n]", InputStr[i]);
		scanf("%c", &temp);
		if (strcmp(InputStr[i], "") == 0 || InputStr[i][0] == ' ' || InputStr[i][strlen(InputStr[i]) - 1] == ' ') {
			i++;
			continue;
		}
		printf("%s\n", InputStr[i]);
		i++;
	}
	

	return 0;
}