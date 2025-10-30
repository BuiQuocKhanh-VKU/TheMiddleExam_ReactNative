type RootStackParamList = {
   Auth:undefined;
   Admin:undefined;
   Client:undefined;
   detail: { id: number; title: string; star: number } | undefined;
   //  Feed: { sort: 'latest' | 'top' } | undefined;
};

declare global {
   namespace ReactNavigation {
      interface RootParamList extends RootStackParamList {}

      //     const navigation = useNavigation();
      //     const route = useRoute();
   }
}

declare module "*.png";
