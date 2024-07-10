import React, { ReactNode } from "react";
import Head from "next/head";

type Props = {
  children?: ReactNode;
  headTitle?: string;
};

const PageHead: React.FunctionComponent<Props> = ({ headTitle }) => {
  return (
    <Head>
      <title>{headTitle ? headTitle : "Hello Akash World!"}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
    </Head>
  );
};
export default PageHead;
