#include <stdio.h>

int main(){
    while(1){
        int a=0, b=0;
        scanf("%d %d", &a, &b);
        if(0<a && b<10){
            printf("%d\n", a-b);
            return 0;
        }
        else{
            printf("Wrong Input!(0<a && b<10)\n");
        }
    }
    return 0;
}